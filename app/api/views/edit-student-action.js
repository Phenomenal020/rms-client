"use server";

import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

export async function updateSelectedStudent(studentData) {
  try {
    // Get the current session to identify the user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If there is no user, return unauthorised
    if (!session?.user) {
      return { error: "Unauthorised" };
    }

    // If the student id is not provided, return an error (student is not valid)
    if (!studentData?.id) {
      return { error: "Invalid student" };
    }

    // Required fields: firstName, lastName
    const firstName = studentData.firstName;
    const lastName = studentData.lastName;
    const middleName = studentData.middleName;
    const rawDaysPresent = studentData.daysPresent;

    // Validation
    // First name is required
    if (typeof firstName !== "string" || firstName.trim() === "") {
      return { error: "First name is required" };
    }
    // Last name is required
    if (typeof lastName !== "string" || lastName.trim() === "") {
      return { error: "Last name is required" };
    }
    // if middle name is provided, it must be a string
    if (
      middleName !== undefined &&
      middleName !== null &&
      typeof middleName !== "string"
    ) {
      return { error: "Middle name must be a string" };
    }
    // Convert days present to a number if it is a valid number
    let daysPresent;
    if (rawDaysPresent !== undefined && rawDaysPresent !== null && rawDaysPresent !== "") {
      const parsed = Number(rawDaysPresent);
      if (Number.isNaN(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
        return { error: "Days present must be a non-negative integer" };
      }
      daysPresent = parsed;
    }

    // Build the update data 
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };
    // parse middlename
    if (middleName !== undefined) {
      const trimmedMiddle = (middleName || "").trim();
      updateData.middleName = trimmedMiddle === "" ? null : trimmedMiddle;
    }
    // parse days present
    if (daysPresent !== undefined) {
      updateData.daysPresent = daysPresent;
    }

    console.log('update data', updateData);

    // fetch the student from the database and update the data
    const student = await prisma.student.update({
      where: { id: studentData.id },
      data: updateData,
    });

    return { success: "Student updated", student };
  } catch (error) {
    console.error("Error editing student:", error);
    return { error: "Failed to update student" };
  }
}

/**
 * Update assessment scores for a student across subjects.
 * Expects payload:
 * {
 *   studentId: string,
 *   subjects: [
 *     {
 *       subjectId: string,
 *       scores: [{ type: string, score: number }]
 *     }
 *   ]
 * }
 */
export async function updateStudentScores({ studentId, subjects }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorised user" };
    }

    if (!studentId || typeof studentId !== "string") {
      return { error: "studentId is required" };
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return { error: "subjects array is required" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        academicTerms: {
          include: { assessmentStructure: true, subjects: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const term = user?.academicTerms?.[0];
    if (!term) {
      return { error: "Academic term not found" };
    }

    const structureByType =
      term.assessmentStructure?.reduce((acc, item) => {
        if (item?.type) acc[item.type] = item;
        return acc;
      }, {}) || {};

    // Validate and normalise payload
    const normalisedSubjects = subjects.map((subj, idx) => {
      if (!subj?.subjectId || typeof subj.subjectId !== "string") {
        throw new Error(`Subject ${idx + 1}: subjectId is required`);
      }
      const scores = Array.isArray(subj.scores) ? subj.scores : [];
      const parsedScores = scores.map((s, sIdx) => {
        const type = s?.type;
        if (!type || !structureByType[type]) {
          throw new Error(`Subject ${idx + 1}, Score ${sIdx + 1}: invalid type`);
        }
        const num = Number(s.score ?? 0);
        if (!Number.isFinite(num) || num < 0) {
          throw new Error(
            `Subject ${idx + 1}, Score ${sIdx + 1}: score must be a non-negative number`
          );
        }
        return { type, score: Math.round(num) };
      });
      return { subjectId: subj.subjectId, scores: parsedScores };
    });

    const assessments = await prisma.$transaction(async (tx) => {
      const updated = [];

      for (const subj of normalisedSubjects) {
        // Ensure student-subject link exists
        let studentSubject = await tx.studentSubject.findFirst({
          where: { studentId, subjectId: subj.subjectId },
        });

        if (!studentSubject) {
          studentSubject = await tx.studentSubject.create({
            data: { studentId, subjectId: subj.subjectId },
          });
        }

        // Upsert assessment per student/subject/term
        const assessment = await tx.assessment.upsert({
          where: {
            studentId_subjectId_academicTermId: {
              studentId,
              subjectId: subj.subjectId,
              academicTermId: term.id,
            },
          },
          update: {},
          create: {
            studentId,
            subjectId: subj.subjectId,
            academicTermId: term.id,
            studentSubjectId: studentSubject.id,
          },
        });

        // Upsert scores against assessmentStructure
        for (const sc of subj.scores) {
          const structure = structureByType[sc.type];
          await tx.assessmentScore.upsert({
            where: {
              assessmentId_assessmentStructureId: {
                assessmentId: assessment.id,
                assessmentStructureId: structure.id,
              },
            },
            update: { score: sc.score },
            create: {
              assessmentId: assessment.id,
              assessmentStructureId: structure.id,
              score: sc.score,
            },
          });
        }

        const refreshed = await tx.assessment.findUnique({
          where: { id: assessment.id },
          include: {
            scores: {
              include: { assessmentStructure: true },
              orderBy: { assessmentStructure: { order: "asc" } },
            },
            subject: true,
          },
        });

        updated.push(refreshed);
      }

      return updated;
    });

    return { success: "Scores updated", assessments };
  } catch (error) {
    console.error("Error updating scores:", error);
    return { error: error.message || "Failed to update scores" };
  }
}

