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
    if (
      rawDaysPresent !== undefined &&
      rawDaysPresent !== null &&
      rawDaysPresent !== ""
    ) {
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

    console.log("update data", updateData);

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

export async function saveStudentScores(
  studentId,
  academicTermId,
  selectedStudentSubjects
) {
  try {
    return await prisma.$transaction(async (tx) => {

      // for each subject in the payload (must be a subject that the student is enrolled in)
      for (const studentSubject of selectedStudentSubjects) {

        // get the subject id and scores
        const { subjectId, scores } = studentSubject;
        if (!subjectId) {
          throw new Error("Subject information is missing");
        }

        // Ensure student is enrolled in the subject (in the database) by finding an entry in the studentSubject table where the student-subject combination exists
        let dbStudentSubject = await tx.studentSubject.findUnique({
          where: {
            studentId_subjectId: {
              studentId,
              subjectId,
            },
          },
        });
        if (!dbStudentSubject) {
          throw new Error(`Student is not enrolled in one or more subjects`);
        } 
        
        // Find or create the Assessment (1 per student–subject–term) for the enrolled student-subject combination
        const assessment = await tx.assessment.upsert({
          where: {
            studentId_subjectId_academicTermId: {
              studentId,
              subjectId: dbStudentSubject.subjectId,
              academicTermId,
            },
          },
          update: {},
          create: {
            studentId,
            subjectId: dbStudentSubject.subjectId,
            academicTermId,
            studentSubjectId: dbStudentSubject.id,
          },
        });

        // Upsert each AssessmentScore (1 score per assessment structure)
        for (const { assessmentStructureId, score } of scores) {
          await tx.assessmentScore.upsert({
            where: {
              assessmentId_assessmentStructureId: {
                assessmentId: assessment.id,
                assessmentStructureId,
              },
            },
            update: {
              score,
            },
            create: {
              assessmentId: assessment.id,
              assessmentStructureId,
              score,
            },
          });
        }
      }

      return { success: "Scores successfully saved" };
    });
  } catch (error) {
    return { error: error.message || "Failed to save student scores" };
  }
}