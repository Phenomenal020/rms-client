// Save scores for all students in a subject (used by subject view)
export async function saveSubjectScores(
  subjectId,
  academicTermId,
  studentsData
) {
  try {
    // Get the current session to identify the user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If there is no user, return unauthorised
    if (!session?.user) {
      return { error: "Unauthorised" };
    }

    // Validate inputs
    if (!subjectId) {
      return { error: "Subject is required" };
    }
    if (!academicTermId) {
      return { error: "Academic term is required" };
    }
    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return { error: "Students data is required" };
    }

    return await prisma.$transaction(async (tx) => {
      // For each student in the payload
      for (const studentData of studentsData) {
        const { studentId, scores } = studentData;

        if (!studentId) {
          throw new Error("Student is missing");
        }

        if (!Array.isArray(scores) || scores.length === 0) {
          throw new Error("Scores are required for each student");
        }

        // Ensure student is enrolled in the subject
        const dbStudentSubject = await tx.studentSubject.findUnique({
          where: {
            studentId_subjectId: {
              studentId,
              subjectId,
            },
          },
        });

        if (!dbStudentSubject) {
          throw new Error(`Student is not enrolled in the subject`);
        }

        // Find or create the Assessment (1 per student–subject–term)
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
          if (!assessmentStructureId) {
            throw new Error("Assessment structure is required for each score");
          }

          // Validate score is a number
          const scoreValue = Number(score);
          if (Number.isNaN(scoreValue) || scoreValue < 0) {
            throw new Error(`Invalid score value`);
          }

          await tx.assessmentScore.upsert({
            where: {
              assessmentId_assessmentStructureId: {
                assessmentId: assessment.id,
                assessmentStructureId,
              },
            },
            update: {
              score: scoreValue,
            },
            create: {
              assessmentId: assessment.id,
              assessmentStructureId,
              score: scoreValue,
            },
          });
        }
      }

      return { success: "Subject scores successfully saved" };
    });
  } catch (error) {
    return { error: "Failed to save subject scores" };
  }
}
