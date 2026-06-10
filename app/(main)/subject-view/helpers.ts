import type { Student, AssessmentStructure, Subject, AssessmentScore } from "@/types/drizzle";

type SubjectRow = Subject & { enrolled?: boolean };

// ---------------------------------------------------------------------------
// Subject-view helpers (parallel role to students-view utils/scoreFns)
// ---------------------------------------------------------------------------

// Students enrolled in the named subject (respects `enrolled` on the junction when present)
export const getEnrolledStudents = (
  subjectName: string | null,
  students: Student[],
): Student[] => {
  if (!subjectName) return [];

  return (students || []).filter((student) =>
    student.subjects?.some((s: SubjectRow) => {
      const nameMatch = s.subject?.name === subjectName;
      if (!nameMatch) return false;
      if (typeof s.enrolled === "boolean") return s.enrolled;
      return true;
    }),
  );
};

// Scores for one student in the selected subject, keyed by assessment type + total
export const getStudentScores = (
  subjectName: string | null,
  student: Student | null,
  assessmentStructure: AssessmentStructure[] = [],
): Record<string, number> => {
  const emptyScores = (): Record<string, number> => {
    const result: Record<string, number> = { total: 0 };
    (assessmentStructure || []).forEach((assessment) => {
      result[assessment.type.toLowerCase()] = 0;
    });
    return result;
  };

  if (!subjectName || !student || !student.subjects) {
    return emptyScores();
  }

  const studentSubject = student.subjects.find(
    (s: Subject) => s.subject?.name === subjectName,
  );
  const assessment = studentSubject?.assessments?.[0];
  if (!studentSubject || !assessment) return emptyScores();

  const scores: Record<string, number> = { total: 0 };

  (assessmentStructure || []).forEach((structure) => {
    const key = structure.type.toLowerCase();
    const entry = assessment.scores?.find(
      (score: AssessmentScore) =>
        score.assessmentStructureId === structure.id ||
        score.assessmentStructure?.type === structure.type,
    );
    const scoreValue = entry?.score || 0;
    scores[key] = scoreValue;
    scores.total += scoreValue;
  });

  return scores;
};

// Aggregate stats for the subject column (enrolled students only)
export const calculateSubjectStats = (
  subjectName: string | null,
  enrolledStudents: Student[],
  assessmentStructure: AssessmentStructure[] = [],
): {
  average: number;
  minimum: number;
  maximum: number;
  classAverage: number;
} | null => {
  if (!subjectName || !enrolledStudents || enrolledStudents.length === 0) {
    return null;
  }

  const totals = enrolledStudents.map((student) => {
    const score = getStudentScores(subjectName, student, assessmentStructure);
    return score.total;
  });

  if (totals.length === 0) return null;

  const sum = totals.reduce((acc, score) => acc + score, 0);
  const average = sum / totals.length;
  const minimum = Math.min(...totals);
  const maximum = Math.max(...totals);

  return {
    average: Math.round(average * 100) / 100,
    minimum: Math.round(minimum * 100) / 100,
    maximum: Math.round(maximum * 100) / 100,
    classAverage: Math.round(average * 100) / 100,
  };
};
