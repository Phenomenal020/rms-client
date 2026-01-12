// make this file a server action
"use server";

import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { validateSchoolUpdate } from "../school/validation";
import { validateTermUpdate } from "../term/validation";

 // Update school and term information atomically. This is intended for the results sheet view where both pieces of data are edited together.

export async function updateSchoolAndTerm(data) {
  try {
    // Get the session to verify the user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If the user is not authenticated, return an unauthorised error
    if (!session?.user) {
      return { error: "Unauthorised" };
    }

    // Fetch current user, school, and latest academic term
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        school: true,
        academicTerms: {
          include: { class: true, gradingSystem: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // If this user is not found in the database, return an unauthorised error (this session is invalid)
    if (!currentUser) {
      return { error: "Unauthorised" };
    }

    // Get the latest academic term for this user
    const latestTerm = currentUser.academicTerms?.[0];

    // get the class and check if it is provided in the form data
    const resolvedClassName = data.className || latestTerm?.class?.name

    // Validate school fields. if valid, set the validated school data. Otherwise, return the error
    const schoolValidation = validateSchoolUpdate(data);
    if (!schoolValidation.isValid) {
      return { error: schoolValidation.error };
    }
    const { validated: validatedSchool } = schoolValidation;

    // Validate term fields (force a className using resolvedClassName). If valid, set the validated term data. Otherwise, return the error
    const termValidation = validateTermUpdate({
      academicYear: data.academicYear,
      term: data.term,
      className: resolvedClassName,
      termDays: data.termDays,
      termStart: data.termStart,
      termEnd: data.termEnd,
      gradingSystem: data.gradingSystem,
    });
    if (!termValidation.isValid) {
      return { error: termValidation.error };
    }
    const { validated: validatedTerm } = termValidation;

    // Use a transaction to update the school and term information atomically
    await prisma.$transaction(async (tx) => {
      // Update school. TODO: Ensure the user doesn/t see this page if the school is not created.
      let schoolId = currentUser.schoolId;
      if (!schoolId) {
        throw new Error("School not found for this user. Please create the school first.");
      }
      // if there is a school, then update it. Get the school data for the update
      const schoolUpdateData = {
        schoolName: validatedSchool.schoolName,
      };

      // Extra guards
      // set fields that are not modified in the form data to undefined. This is so prisma can skip and not update them. If the field was cleared in the form, then set it to null - prisma clears it in the db as well.
      if (data.schoolAddress !== undefined) {
        schoolUpdateData.schoolAddress =
          validatedSchool.schoolAddress ?? null;
      }
      if (data.schoolMotto !== undefined) {
        schoolUpdateData.schoolMotto = validatedSchool.schoolMotto ?? null;
      }
      if (data.schoolTelephone !== undefined) {
        schoolUpdateData.schoolTelephone =
          validatedSchool.schoolTelephone ?? null;
      }
      if (data.schoolEmail !== undefined) {
        schoolUpdateData.schoolEmail = validatedSchool.schoolEmail ?? null;
      }

      // Update the school
      await tx.school.update({
        where: { id: schoolId },
        data: schoolUpdateData,
      });

      // Handle class resolution (Ensure the class is valid so term doesnt point to a non-existent class)
      // Find the class if it is not found, throw an error.
      let classEntity = await tx.class.findUnique({
        where: {
          schoolId_name: { // unique constraint
            schoolId,
            name: validatedTerm.className,
          },
        },
      });
      if (!classEntity) {
        throw new Error("Class not found. Please create the class first.");
      }

      // If no term, create one; otherwise update latest
      let academicTerm = latestTerm;
      if (!academicTerm) {
        throw new Error("Academic term not found. Please create the academic term first.");
      } else {
        // Update the term
        const termUpdateData = {
          academicYear: validatedTerm.academicYear,
          term: validatedTerm.term,
          classId: classEntity.id,
        };

        if (data.termDays !== undefined) {
          termUpdateData.termDays = validatedTerm.termDays ?? null;
        }
        if (data.termStart !== undefined) {
          termUpdateData.termStart = validatedTerm.termStart ?? null;
        }
        if (data.termEnd !== undefined) {
          termUpdateData.termEnd = validatedTerm.termEnd ?? null;
        }

        // Unique check if class/year/term changed
        if (
          academicTerm.academicYear !== validatedTerm.academicYear ||
          academicTerm.term !== validatedTerm.term ||
          academicTerm.classId !== classEntity.id
        ) {
          const existingTerm = await tx.academicTerm.findUnique({
            where: {
              classId_academicYear_term: {
                classId: classEntity.id,
                academicYear: validatedTerm.academicYear,
                term: validatedTerm.term,
              },
            },
          });

          if (existingTerm && existingTerm.id !== academicTerm.id) {
            throw new Error(
              "An academic term with this class, year, and term already exists"
            );
          }
        }

        academicTerm = await tx.academicTerm.update({
          where: { id: academicTerm.id },
          data: termUpdateData,
        });
      }
    });

    // Revalidate relevant views
    revalidatePath("/view/results");
    revalidatePath("/settings/school");

    return { success: "School and term information updated successfully" };
  } catch (error) {
    return { error: "Failed to update school and term" };
  }
}