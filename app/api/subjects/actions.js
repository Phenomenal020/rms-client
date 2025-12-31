// make this file as a server action
"use server";

// imports: prisma, auth, revalidatePath, headers
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { validateSubjectsUpdate } from "./validation";

// Update subjects and assessment structure function
export async function updateSubjects(data) {
  try {
    // Get the current session to identify the user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If there is no user, return unauthorised
    if (!session?.user) {
      return { error: "Unauthorised user" };
    }

    // Validate the data
    const validation = validateSubjectsUpdate(data);
    if (!validation.isValid) {
      return { error: validation.error };
    }

    // Destructure the subjects data
    let { subjects, assessmentStructure } = data;

    // Get the current user to check if they have a school and academic term
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        school: true,
        academicTerms: {
          include: {
            subjects: {
              orderBy: {
                createdAt: 'asc',
              },
            },
            assessmentStructure: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!currentUser) {
      return { error: "User unauthorised" };
    }

    // Check if user has a school
    if (!currentUser.schoolId) {
      return { error: "Please set up your school first before adding subjects" };
    }

    // Get the current academic term (most recent one)
    const academicTerm = currentUser.academicTerms?.[0];
    if (!academicTerm) {
      return { error: "Please set up your academic term first before adding subjects" };
    }

    // Execute all database operations in a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Get the academic term with existing subjects and assessment structure
      const termWithData = await tx.academicTerm.findUnique({
        where: { id: academicTerm.id },
        include: {
          subjects: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          assessmentStructure: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (!termWithData) {
        throw new Error("Academic term not found");
      }

      // Update subjects
      // Get existing subjects for comparison
      const existingSubjects = termWithData.subjects || [];
      
      // Normalize for comparison (sort by name)
      const existingNormalised = existingSubjects.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      const newNormalised = subjects.sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      // Check if subjects have changed
      const subjectsChanged =
        existingNormalised.length !== newNormalised.length ||
        existingNormalised.some((existing, index) => {
          const newSubject = newNormalised[index];
          return !newSubject || existing.name !== newSubject.name;
        });

      if (subjectsChanged) {
        // Before deleting subjects, preserve StudentSubject relationships
        // Get all students with their subject relationships
        const studentsWithSubjects = await tx.student.findMany({
          where: { academicTermId: termWithData.id },
          include: {
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        });

        // Create a map of subject name -> array of student IDs that have this subject
        const subjectNameToStudentIds = new Map();
        studentsWithSubjects.forEach((student) => {
          student.subjects.forEach((studentSubject) => {
            const subjectName = studentSubject.subject.name;
            if (!subjectNameToStudentIds.has(subjectName)) {
              subjectNameToStudentIds.set(subjectName, []);
            }
            subjectNameToStudentIds.get(subjectName).push(student.id);
          });
        });

        // Delete existing subjects (this will cascade delete StudentSubject records)
        await tx.subject.deleteMany({
          where: { academicTermId: termWithData.id },
        });

        // Create new subjects if array is provided and not empty
        if (Array.isArray(subjects) && subjects.length > 0) {
          const createdSubjects = await Promise.all(
            subjects.map((subject) =>
              tx.subject.create({
                data: {
                  name: subject.name.trim(),
                  academicTermId: termWithData.id,
                },
              })
            )
          );

          // Recreate StudentSubject relationships for subjects that still exist
          const studentSubjectRecords = [];
          createdSubjects.forEach((newSubject) => {
            const studentIds = subjectNameToStudentIds.get(newSubject.name) || [];
            studentIds.forEach((studentId) => {
              studentSubjectRecords.push({
                studentId: studentId,
                subjectId: newSubject.id,
              });
            });
          });

          // Create StudentSubject records in bulk if there are any
          if (studentSubjectRecords.length > 0) {
            await tx.studentSubject.createMany({
              data: studentSubjectRecords,
              skipDuplicates: true, // Skip if duplicate student-subject pair exists
            });
          }
        }
      }

      // Update assessment structure
      // Get existing assessment structure for comparison
      const existingAssessmentStructure = termWithData.assessmentStructure || [];

      // Normalize for comparison (sort by type) - only for comparison, don't mutate original arrays
      const existingAssessNormalised = [...existingAssessmentStructure].sort((a, b) =>
        a.type.localeCompare(b.type)
      );
      const newAssessNormalised = [...assessmentStructure].sort((a, b) =>
        a.type.localeCompare(b.type)
      );

      // Check if assessment structure has changed (type, percentage, or order)
      const assessmentChanged =
        existingAssessNormalised.length !== newAssessNormalised.length ||
        existingAssessNormalised.some((existing, index) => {
          const newAssess = newAssessNormalised[index];
          return (
            !newAssess ||
            existing.type !== newAssess.type ||
            existing.percentage !== Number(newAssess.percentage) ||
            existing.order !== Number(newAssess.order)
          );
        });

      if (assessmentChanged) {
        // Delete existing assessment structure
        await tx.assessmentStructure.deleteMany({
          where: { academicTermId: termWithData.id },
        });

        // Create new assessment structure if array is provided and not empty
        // Sort by order field to ensure correct creation order
        const sortedAssessments = [...assessmentStructure].sort((a, b) => 
          (a.order || 0) - (b.order || 0)
        );
        if (Array.isArray(sortedAssessments) && sortedAssessments.length > 0) {
          await tx.assessmentStructure.createMany({
            data: sortedAssessments.map((assess) => ({
              type: assess.type.trim(),
              percentage: Number(assess.percentage),
              order: assess.order !== null && assess.order !== undefined ? Number(assess.order) : null,
              academicTermId: termWithData.id,
            })),
          });
        }
      }
    });

    // Revalidate the page so UI updates
    revalidatePath("/settings/subjects");

    return {
      success: "Subjects and assessment structure updated successfully",
    };
  } catch (error) {
    console.error("Error updating subjects:", error);

    // Handle specific error messages from transaction
    if (error.message) {
      // If it's a validation error we threw, return the message
      const validationErrors = [
        "Please set up your school first before adding subjects",
        "School not found",
        "Academic term not found",
      ];

      if (validationErrors.includes(error.message)) {
        return { error: error.message };
      }
    }

    // Handle Prisma errors
    if (error.code === "P2002") {
      return { error: "A subject or assessment component with this name already exists" };
    }

    return { error: error.message || "Failed to update subjects and assessment structure" };
  }
}

