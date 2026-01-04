// make this file as a server action
"use server";

// imports: prisma, auth, revalidatePath, headers
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { validateStudentsUpdate } from "./validation";

// Update students function
export async function updateStudents(studentsData) {
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
    const validation = validateStudentsUpdate(studentsData);
    if (!validation.isValid) {
      return { error: validation.error };
    }

    // Destructure the students data
    let { students } = studentsData;

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
            students: {
              include: {
                subjects: {
                  include: {
                    subject: true,
                  },
                },
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
      return { error: "Please set up your school first before adding students" };
    }

    // Get the current academic term (most recent one)
    const academicTerm = currentUser.academicTerms?.[0];
    if (!academicTerm) {
      return { error: "Please set up your academic term first before adding students" };
    }

    // Get academic term subjects for lookup
    const termSubjects = academicTerm.subjects || [];
    if (termSubjects.length === 0) {
      return { error: "Please add subjects to your academic term first" };
    }

    // Execute all database operations in a transaction for atomicity
    const updatedStudents = await prisma.$transaction(async (tx) => {
      // Get the academic term with existing subjects and students
      const termWithData = await tx.academicTerm.findUnique({
        where: { id: academicTerm.id },
        include: {
          subjects: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          students: {
            include: {
              subjects: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      });

      if (!termWithData) {
        throw new Error("Academic term not found");
      }

      // Process each student
      const processedStudents = [];

      for (const studentData of students) {

        // Prepare student data
        const studentUpdateData = {
          firstName: studentData.firstName.trim(),
          lastName: studentData.lastName.trim(),
          academicTermId: termWithData.id,
        };

        // Add optional fields
        if (studentData.middleName) {
          studentUpdateData.middleName = studentData.middleName.trim();
        }

        // Convert dateOfBirth from ISO string to Date
        if (studentData.dateOfBirth) {
          const dateOfBirth = new Date(studentData.dateOfBirth);
          if (!isNaN(dateOfBirth.getTime())) {
            studentUpdateData.dateOfBirth = dateOfBirth;
          }
        }

        // Add gender enum if provided (allow NONE, MALE, FEMALE)
        if (studentData.gender && ["NONE", "MALE", "FEMALE"].includes(studentData.gender)) {
          // Only set if not NONE (NONE means undefined/null in database)
          if (studentData.gender !== "NONE") {
            studentUpdateData.gender = studentData.gender;
          }
        }

        // Add department enum if provided
        if (
          studentData.department &&
          ["NONE", "SCIENCE", "ARTS", "COMMERCE", "GENERAL"].includes(studentData.department)
        ) {
          studentUpdateData.department = studentData.department;
        }

        // Convert daysPresent to Int (double check)
        if (studentData.daysPresent !== undefined && studentData.daysPresent !== null) {
          const daysPresentNum = Number(studentData.daysPresent);
          if (!isNaN(daysPresentNum) && daysPresentNum >= 0) {
            studentUpdateData.daysPresent = daysPresentNum;
          }
        }

        // Check if student exists (by ID if provided, or create new)
        let student;
        const studentId = typeof studentData.id === "string" ? studentData.id : String(studentData.id);

        // TODO: Fix this later. Check if this is an existing student (has valid UUID)
        const isExistingStudent = studentId && studentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

        if (isExistingStudent) {
          // Update existing student
          student = await tx.student.update({
            where: { id: studentId },
            data: studentUpdateData,
          });

          // Delete existing student-subject relationships
          await tx.studentSubject.deleteMany({
            where: { studentId: student.id },
          });
        } else {
          // Check for duplicate student in the same academic term
          // Get all existing students in this term and check for duplicates (case-insensitive)
          const existingStudents = await tx.student.findMany({
            where: {
              academicTermId: termWithData.id,
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
            },
          });

          // Normalize names for comparison (trim and lowercase)
          const normalisedFirstName = studentUpdateData.firstName.trim().toLowerCase();
          const normalisedLastName = studentUpdateData.lastName.trim().toLowerCase();
          const normalisedMiddleName = studentUpdateData.middleName?.trim().toLowerCase() || "";

          // Check if a duplicate exists
          const duplicate = existingStudents.find((existing) => {
            const existingFirstName = (existing.firstName || "").trim().toLowerCase();
            const existingLastName = (existing.lastName || "").trim().toLowerCase();
            const existingMiddleName = (existing.middleName || "").trim().toLowerCase();

            // First and last names must match
            if (existingFirstName !== normalisedFirstName || existingLastName !== normalisedLastName) {
              return false;
            }

            // If both have middle names, they must match
            if (normalisedMiddleName && existingMiddleName) {
              return normalisedMiddleName === existingMiddleName;
            }

            // If one has middle name and the other doesn't, they're different
            if (normalisedMiddleName || existingMiddleName) {
              return false;
            }

            // Both don't have middle names, so they match
            return true;
          });

          if (duplicate) {
            const fullName = `${studentUpdateData.firstName} ${studentUpdateData.middleName || ""} ${studentUpdateData.lastName}`.trim();
            throw new Error(`A student named "${fullName}" already exists in this academic term`);
          }

          // Create new student
          student = await tx.student.create({
            data: studentUpdateData,
          });
        }

        // Handle subjects - look up subject IDs by name
        // Accept both 'subjects' and 'studentSubjects' for backward compatibility
        const subjectsData = studentData.subjects || studentData.studentSubjects;
        if (subjectsData && subjectsData.length > 0) {
          const subjectNames = subjectsData.map((subject) =>
            typeof subject === "object" ? subject.name : subject
          );

          // Find matching subjects from academic term
          const matchingSubjects = termWithData.subjects.filter((subject) =>
            subjectNames.includes(subject.name)
          );

          if (matchingSubjects.length !== subjectNames.length) {
            const foundNames = matchingSubjects.map((s) => s.name);
            const missingNames = subjectNames.filter((name) => !foundNames.includes(name));
            throw new Error(
              `Subject(s) not found: ${missingNames.join(", ")}. Please ensure all subjects are added to your school first.`
            );
          }

          // Create StudentSubject records
          if (matchingSubjects.length > 0) {
            await tx.studentSubject.createMany({
              data: matchingSubjects.map((subject) => ({
                studentId: student.id,
                subjectId: subject.id,
              })),
            });
          }
        }

        // Fetch the created/updated student with subjects
        const studentWithSubjects = await tx.student.findUnique({
          where: { id: student.id },
          include: {
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        });

        processedStudents.push(studentWithSubjects);
      }

      return processedStudents;
    });

    // Revalidate the page so UI updates
    revalidatePath("/settings/students");

    return {
      success: `${updatedStudents.length} student${updatedStudents.length > 1 ? "s" : ""} saved successfully`,
      students: updatedStudents,
    };
  } catch (error) {
    console.error("Error updating students:", error);

    // Handle specific error messages from transaction
    if (error.message) {
      // If it's a validation error we threw, return the message
      const validationErrors = [
        "Please set up your school first before adding students",
        "Please add subjects to your academic term first",
        "Academic term not found",
        "already exists in this academic term",
        "Subject(s) not found",
      ];

      if (validationErrors.some((err) => error.message.includes(err))) {
        return { error: error.message };
      }
    }

    // Handle Prisma errors
    if (error.code === "P2002") {
      return { error: "A student with this information already exists" };
    }

    return { error: error.message || "Failed to update students" };
  }
}