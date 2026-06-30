import type { Student, AssessmentStructure, Subject, AssessmentScore } from "@/types/drizzle";

type SubjectRow = Subject & { enrolled?: boolean; subjectId?: string };

function matchesSubjectId(row: SubjectRow, subjectId: string): boolean {
  const rowSubjectId = row.subjectId ?? row.subject?.subjectId;
  return rowSubjectId === subjectId;
}

// ---------------------------------------------------------------------------
// Subject-view helpers (parallel role to students-view utils/scoreFns)
// ---------------------------------------------------------------------------

// Students enrolled in the subject (respects `enrolled` on the junction when present)
export const getEnrolledStudents = (
  subjectId: string | null,
  students: Student[],
): Student[] => {
  if (!subjectId) return [];

  return (students || []).filter((student) =>
    student.subjects?.some((s: SubjectRow) => {
      if (!matchesSubjectId(s, subjectId)) return false;
      if (typeof s.enrolled === "boolean") return s.enrolled;
      return true;
    }),
  );
};

// Scores for one student in the selected subject, keyed by assessment type + total
export const getStudentScores = (
  subjectId: string | null,
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

  if (!subjectId || !student || !student.subjects) {
    return emptyScores();
  }

  const studentSubject = student.subjects.find((s: SubjectRow) =>
    matchesSubjectId(s, subjectId),
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
  subjectId: string | null,
  enrolledStudents: Student[],
  assessmentStructure: AssessmentStructure[] = [],
): {
  average: number;
  minimum: number;
  maximum: number;
  classAverage: number;
} | null => {
  if (!subjectId || !enrolledStudents || enrolledStudents.length === 0) {
    return null;
  }

  const totals = enrolledStudents.map((student) => {
    const score = getStudentScores(subjectId, student, assessmentStructure);
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
