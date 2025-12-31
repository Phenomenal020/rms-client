// make this file as a server action
"use server";

// imports: prisma, auth, revalidatePath, headers
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { validateTermUpdate } from "./validation";


export async function updateTerm(termData) {
  // console.log("updateTerm server action called with data:", termData);
  try {
    // Get the current session to identify the user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If there is no user, return unauthorised
    if (!session?.user) {
      return { error: "Unauthorised user" };
    }

    // Validate term data
    const validation = validateTermUpdate(termData);
    if (!validation.isValid) {
      return { error: validation.error };
    }

    const { validated } = validation;

    // Get the current user with school and academic terms
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        school: true,
        academicTerms: {
          include: {
            gradingSystem: true,
          },
          take: 1,
        },
      },
    });

    // If the user is not found, return unauthorised
    if (!currentUser) {
      return { error: "User unauthorised" };
    }

    // User must have a school before creating/updating a term
    if (!currentUser.schoolId) {
      return { error: "Please set up your school information first" };
    }

    // Execute database operations in a transaction
    await prisma.$transaction(async (tx) => {
      let academicTerm = currentUser.academicTerms?.[0];

      // If no academic term exists, create one
      if (!academicTerm) {
        // Find or create the Class
        let classEntity = await tx.class.findUnique({
          where: {
            schoolId_name: {
              schoolId: currentUser.schoolId,
              name: validated.className,
            },
          },
        });

        if (!classEntity) {
          classEntity = await tx.class.create({
            data: {
              name: validated.className,
              schoolId: currentUser.schoolId,
            },
          });
        }

        // Check for unique constraint violation
        const existingTerm = await tx.academicTerm.findUnique({
          where: {
            classId_academicYear_term: {
              classId: classEntity.id,
              academicYear: validated.academicYear,
              term: validated.term,
            },
          },
        });

        if (existingTerm) {
          throw new Error("An academic term with this class, year, and term already exists");
        }

        // Create new academic term
        academicTerm = await tx.academicTerm.create({
          data: {
            academicYear: validated.academicYear,
            term: validated.term,
            termDays: validated.termDays,
            termStart: validated.termStart ?? null,
            termEnd: validated.termEnd ?? null,
            resultTemplateUrl: termData.resultTemplateUrl ?? null,
            userId: session.user.id,
            schoolId: currentUser.schoolId,
            classId: classEntity.id,
          },
        });
      } else {
        // Update existing academic term
        const termUpdateData = {
          academicYear: validated.academicYear,
          term: validated.term,
        };

        // Optional fields (only update if provided)
        if (termData.termDays !== undefined && termData.termDays !== null) {
          termUpdateData.termDays = validated.termDays;
        } else if (termData.termDays === null) {
          termUpdateData.termDays = null; // Explicitly clear if null
        }
        if (termData.termStart !== undefined) {
          termUpdateData.termStart = validated.termStart ?? null;
        }
        if (termData.termEnd !== undefined) {
          termUpdateData.termEnd = validated.termEnd ?? null;
        }
        if (termData.resultTemplateUrl !== undefined) {
          termUpdateData.resultTemplateUrl = termData.resultTemplateUrl;
        }

        // Get the class for this term
        const classEntity = await tx.class.findUnique({
          where: { id: academicTerm.classId },
        });

        // If className changed, find or create new class
        let updatedClassId = academicTerm.classId;
        if (!classEntity || classEntity.name !== validated.className) {
          let newClass = await tx.class.findUnique({
            where: {
              schoolId_name: {
                schoolId: currentUser.schoolId,
                name: validated.className,
              },
            },
          });

          if (!newClass) {
            newClass = await tx.class.create({
              data: {
                name: validated.className,
                schoolId: currentUser.schoolId,
              },
            });
          }
          updatedClassId = newClass.id;
        }
        
        // Always set classId (either existing or new)
        termUpdateData.classId = updatedClassId;

        // Check for unique constraint violation if academicYear, term, or class changed
        if (
          academicTerm.academicYear !== validated.academicYear ||
          academicTerm.term !== validated.term ||
          updatedClassId !== academicTerm.classId
        ) {
          const existingTerm = await tx.academicTerm.findUnique({
            where: {
              classId_academicYear_term: {
                classId: updatedClassId,
                academicYear: validated.academicYear,
                term: validated.term,
              },
            },
          });

          if (existingTerm && existingTerm.id !== academicTerm.id) {
            throw new Error("An academic term with this class, year, and term already exists");
          }
        }

        academicTerm = await tx.academicTerm.update({
          where: { id: academicTerm.id },
          data: termUpdateData,
        });
      }

      // Update grading system if provided
      if (validated.gradingSystem !== undefined) {
        // Delete existing grading system entries
        await tx.gradingSystem.deleteMany({
          where: { academicTermId: academicTerm.id },
        });

        // Create new grading system entries if array is provided and not empty
        if (Array.isArray(validated.gradingSystem) && validated.gradingSystem.length > 0) {
          await tx.gradingSystem.createMany({
            data: validated.gradingSystem.map((entry) => ({
              grade: entry.grade.trim(),
              minScore: typeof entry.minScore === "number" ? entry.minScore : Number(entry.minScore),
              maxScore: typeof entry.maxScore === "number" ? entry.maxScore : Number(entry.maxScore),
              remark: entry.remark?.trim() || null,
              academicTermId: academicTerm.id,
            })),
          });
        }
      }
    });

    // Revalidate the page so UI updates
    revalidatePath("/settings/term");

    return {
      success: "Term information updated successfully",
    };
  } catch (error) {
    console.error("Term update error:", error);

    // Handle specific error messages
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return { error: error.message };
      }
      return { error: error.message || "Failed to update term information" };
    }

    return { error: "Failed to update term information" };
  }
}

