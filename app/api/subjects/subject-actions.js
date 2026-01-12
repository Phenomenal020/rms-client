// make this file as a server action
"use server";

// imports: prisma, auth, revalidatePath, headers
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  SUBJECT_VALIDATION_ERRORS,
  validateSubjectsInput,
  validateUserContext,
} from "./subject-actions-validation";

// Update subjects function
export async function updateSubjects(subjects) {
  try {
    // Get the current session to identify the user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If there is user is not authenticated, return unauthorised
    if (!session?.user) {
      return { error: "Unauthorised user" };
    }

    // Validate subjects payload
    const subjectsValidationError = validateSubjectsInput(subjects);
    if (subjectsValidationError) {
      return { error: subjectsValidationError };
    }

    // Get the current user to retrieve the subjects in the database (if any)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        school: true,
        academicTerms: {
          include: {
            subjects: true,
          },
          take: 1, // get the most recent academic term
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const { error: userContextError, academicTerm } =
      validateUserContext(currentUser);
    if (userContextError) {
      return { error: userContextError };
    }

    // Get existing subjects and frontend ids for comparison to know which subjects to delete
    const existingSubjects = academicTerm.subjects;
    const frontEndIds = subjects.map((s) => s.id).filter(Boolean);

    // Subjects that exist in DB but not in payload → DELETE
    const subjectsToDelete = existingSubjects.filter(
      (dbSubject) => !frontEndIds.includes(dbSubject.id)
    );

    // Transaction to delete removed subjects, update existing subjects, and create new subjects
    await prisma.$transaction([
      // Delete removed subjects - those not in the payload
      ...subjectsToDelete.map((s) =>
        prisma.subject.delete({
          where: { id: s.id },
        })
      ),

      // Update existing subjects - those already in the database
      ...subjects
        .filter((s) => s.id)
        .map((s) =>
          prisma.subject.update({
            where: { id: s.id },
            data: { name: s.name },
          })
        ),

      // Create new subjects - those not in the database yet
      ...subjects
        .filter((s) => !s.id)
        .map((s) =>
          prisma.subject.create({
            data: {
              name: s.name,
              academicTermId: academicTerm.id,
            },
          })
        ),
    ]);

    // Revalidate the page so UI updates
    revalidatePath("/settings/subjects");

    return {
      success: "Subjects updated successfully",
    };
  } catch (error) {
    // Handle specific error messages from transaction
    if (error.message) {
      // If it's a validation error we threw, return the message
      if (SUBJECT_VALIDATION_ERRORS.includes(error.message)) {
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

    return {
      error:
        error.message || "Failed to update subjects and assessment structure",
    };
  }
}
