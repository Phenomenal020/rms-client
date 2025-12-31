// make this file as a server action
"use server";

// imports: prisma, auth, revalidatePath, headers
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { validateSchoolUpdate } from "./validation";

// update school server action
export async function updateSchool(schoolData) {
  try {
    // Get the current session to identify the user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If there is no user, return unauthorised
    if (!session?.user) {
      return { error: "Unauthorised user" };
    }

    // Validate school data
    const validation = validateSchoolUpdate(schoolData);
    if (!validation.isValid) {
      return { error: validation.error };
    }

    const { validated } = validation;

    // Get the current user to check if they have a school
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        school: true,
      },
    });

    // If the user is not found, return unauthorised
    if (!currentUser) {
      return { error: "User unauthorised" };
    }

    // Execute database operations in a transaction
    await prisma.$transaction(async (tx) => {
      // If user doesn't have a school, create one
      if (!currentUser.schoolId) {
        const school = await tx.school.create({
          data: {
            schoolName: validated.schoolName, // required field
            schoolAddress: validated.schoolAddress ?? null, // optional field
            schoolMotto: validated.schoolMotto ?? null,
            schoolTelephone: validated.schoolTelephone ?? null,
            schoolEmail: validated.schoolEmail ?? null,
          },
        });

        // Link school to user
        await tx.user.update({
          where: { id: session.user.id },
          data: { schoolId: school.id },
        });
      } else {
        // Update existing school
        const schoolUpdateData = {
          schoolName: validated.schoolName,
        };

        // Only include fields that are explicitly provided even if they are empty strings (not undefined)
        if (schoolData.schoolAddress !== undefined) {
          schoolUpdateData.schoolAddress = validated.schoolAddress ?? null;
        }
        if (schoolData.schoolMotto !== undefined) {
          schoolUpdateData.schoolMotto = validated.schoolMotto ?? null;
        }
        if (schoolData.schoolTelephone !== undefined) {
          schoolUpdateData.schoolTelephone = validated.schoolTelephone ?? null;
        }
        if (schoolData.schoolEmail !== undefined) {
          schoolUpdateData.schoolEmail = validated.schoolEmail ?? null;
        }

        await tx.school.update({
          where: { id: currentUser.schoolId },
          data: schoolUpdateData,
        });
      }
    });

    // Revalidate the page so UI updates
    revalidatePath("/settings/school");

    return {
      success: "School information updated successfully",
    };
  } catch (error) {
    console.error("School update error:", error);
    
    // Handle Prisma errors
    if (error.code === "P2002") {
      return { error: "School name already exists" };
    }

    // Return error message if available
    if (error instanceof Error) {
      return { error: error.message || "Failed to update school information" };
    }
    
    return { error: "Failed to update school information" };
  }
}
