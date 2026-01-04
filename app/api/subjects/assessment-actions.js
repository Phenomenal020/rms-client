// make this file as a server action
"use server";

// imports: prisma, auth, revalidatePath, headers
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  ASSESSMENT_VALIDATION_ERRORS,
  validateSubjectsUpdate,
} from "./assessment-actions-validation";

// Update assessment structure function
export async function updateAssessmentStructure(data) {
  // Support both array payloads and { assessmentStructure } objects
  const assessmentStructure = Array.isArray(data)
    ? data
    : Array.isArray(data?.assessmentStructure)
    ? data.assessmentStructure
    : null;

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
    const validation = validateSubjectsUpdate({
      assessmentStructure,
    });
    if (!validation.isValid) {
      return { error: validation.error };
    }

    // Get the current user to check if they have a school and academic term
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        school: true,
        academicTerms: {
          include: {
            assessmentStructure: true,
          },
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!currentUser) {
      return { error: "User unauthorised" };
    }

    if (!currentUser.schoolId) {
      return {
        error: "Please set up your school first before adding subjects",
      };
    }

    const academicTerm = currentUser.academicTerms?.[0];
    if (!academicTerm) {
      return {
        error: "Please set up your academic term first before adding subjects",
      };
    }

    const existingAssessments = academicTerm.assessmentStructure || [];
    const incoming = assessmentStructure || [];

    // IDs present from the client payload
    const frontEndIds = incoming.map((a) => a.id).filter(Boolean);
    // Records to delete: in DB but not in payload
    const assessmentsToDelete = existingAssessments.filter(
      (dbAssess) => !frontEndIds.includes(dbAssess.id)
    );

    // Execute all database operations in a transaction for atomicity
    await prisma.$transaction([
      // Delete removed assessments
      ...assessmentsToDelete.map((a) =>
        prisma.assessmentStructure.delete({
          where: { id: a.id },
        })
      ),

      // Update existing assessments
      ...incoming
        .filter((a) => a.id)
        .map((a) =>
          prisma.assessmentStructure.update({
            where: { id: a.id },
            data: {
              type: a.type.trim(),
              percentage: Number(a.percentage),
              order: Number(a.order),
            },
          })
        ),

      // Create new assessments
      ...incoming
        .filter((a) => !a.id)
        .map((a) =>
          prisma.assessmentStructure.create({
            data: {
              type: a.type.trim(),
              percentage: Number(a.percentage),
              order: Number(a.order),
              academicTermId: academicTerm.id,
            },
          })
        ),
    ]);

    // Revalidate the page so UI updates
    revalidatePath("/settings/subjects");

    return {
      success: "Subjects and assessment structure updated successfully",
    };
  } catch (error) {
    console.error("Error updating subjects:", error);

    // Handle specific error messages from transaction
    if (error.message) {
      if (ASSESSMENT_VALIDATION_ERRORS.includes(error.message)) {
        return { error: error.message };
      }
    }

    // Handle Prisma errors
    if (error.code === "P2002") {
      return {
        error:
          "A subject or assessment component with this name already exists",
      };
    }

    return { error: "Failed to update assessment structure" };
  }
}
