import type { AssessmentStructure } from "@/types/drizzle";
import type { ClassRecordStudentRow, ClassRecordSubjectRow } from "@/fetcher/queries";
import {
  NO_SCORE,
  formatScoreDisplay,
  formatStatPercent,
} from "../subject-view/helpers";

export { NO_SCORE, formatScoreDisplay, formatStatPercent };

export type ClassRecordSubjectScoreRow = {
  assessmentStructureId: string;
  score: number;
};

function getSubjectScores(subject: ClassRecordSubjectRow): ClassRecordSubjectScoreRow[] {
  return subject.assessments?.[0]?.scores ?? [];
}

export function isSubjectEnrolled(subject: ClassRecordSubjectRow): boolean {
  return subject.enrolled === true;
}

// Score for one assessment type on a subject row; NO_SCORE when missing.
export function getSubjectAssessmentScoreValue(
  subject: ClassRecordSubjectRow,
  assessmentStructureId: string,
): number {
  const entry = getSubjectScores(subject).find(
    (score) => score.assessmentStructureId === assessmentStructureId,
  );
  return entry?.score ?? NO_SCORE;
}

// Sum scores across the full assessment structure; returns NO_SCORE if any component is missing.
export function getSubjectTotalFromScores(
  subject: ClassRecordSubjectRow,
  assessmentStructure: AssessmentStructure[] = [],
): number {
  if (!assessmentStructure.length) return NO_SCORE;

  let total = 0;
  for (const structure of assessmentStructure) {
    const value = getSubjectAssessmentScoreValue(subject, structure.id);
    if (value === NO_SCORE) return NO_SCORE;
    total += value;
  }
  return total;
}

export type StudentPerformanceStats = {
  totalMarks: number;
  average: number;
  overallGrade: string | null;
  overallRemark: string | null;
  enrolledSubjectCount: number;
};

// Performance summary for one student (form-teacher class record view).
export function calculateStudentStats(
  student: ClassRecordStudentRow | null,
  assessmentStructure: AssessmentStructure[] = [],
  getOverallGrade: (percentage: number) => string | null,
  getOverallRemark: (grade: string | null) => string | null,
): StudentPerformanceStats | null {
  if (!student?.subjects?.length) return null;

  const enrolledSubjects = student.subjects.filter(isSubjectEnrolled);
  if (enrolledSubjects.length === 0) return null;

  const subjectTotals = enrolledSubjects.map((subject) =>
    getSubjectTotalFromScores(subject, assessmentStructure),
  );
  const validTotals = subjectTotals.filter((total) => total !== NO_SCORE);

  if (validTotals.length === 0) {
    return {
      totalMarks: NO_SCORE,
      average: NO_SCORE,
      overallGrade: null,
      overallRemark: null,
      enrolledSubjectCount: enrolledSubjects.length,
    };
  }

  const totalMarks = validTotals.reduce((sum, score) => sum + score, 0);
  const average = totalMarks / validTotals.length;
  const roundedAverage = Math.round(average * 100) / 100;
  const overallGrade = getOverallGrade(roundedAverage);
  const overallRemark = getOverallRemark(overallGrade);

  return {
    totalMarks,
    average: roundedAverage,
    overallGrade,
    overallRemark,
    enrolledSubjectCount: enrolledSubjects.length,
  };
}

export function formatGradeDisplay(
  total: number,
  getGrade: (percentage: number) => string | null,
): string {
  if (total === NO_SCORE) return "-";
  return getGrade(total) ?? "-";
}

export function formatRemarkDisplay(
  total: number,
  getGrade: (percentage: number) => string | null,
  getRemark: (grade: string | null) => string | null,
): string {
  if (total === NO_SCORE) return "-";
  const grade = getGrade(total);
  return getRemark(grade) ?? "-";
}
