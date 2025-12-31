// make this file as a server action
"use server";

// imports: prisma, auth, revalidatePath, headers, and validation helper
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { validateProfileUpdate } from "./validation";

// update profile server action
export async function updateProfile(profileData) {
  // Get session user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If there's no user, return unauthorised
  if (!session?.user) {
    return { error: "Unauthorised" };
  }

  // Validate profile data
  const validation = validateProfileUpdate(profileData);
  if (!validation.isValid) {
    return { error: validation.error };
  }

  // if validation is successful, get the first name and last name
  const { firstName, lastName } = profileData;

  try {
    // Update prisma user - only firstName and lastName (subscription and role are read-only)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: session.user.email, // include the email as its required by prisma
      },
    });

    // Revalidate page so UI updates
    revalidatePath("/settings/profile");

    return {
      success: "Profile updated successfully",
    };
  } catch (error) {
    // if there is an error, return an error message
    return { error: "Failed to update profile" };
  }
}
