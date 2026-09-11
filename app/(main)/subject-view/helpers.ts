import type { AssessmentStructure } from "@/types/drizzle";
import type { SubjectRecordScoreRow, SubjectRecordStudentRow, TeacherSubjectAssignmentRow } from "@/fetcher/queries";

// Fallback for a score that has not been entered yet
export const NO_SCORE = -1;

// Format the score display
export function formatScoreDisplay(value: number): string {
  return value === NO_SCORE ? "-" : String(value);
}

// Format the percentage display
export function formatStatPercent(value: number | undefined | null): string {
  if (value == null || value === NO_SCORE) return "-";
  return `${value}%`;
}

// Get the score value for a given assessment structure id. If there is no score yet for the assessment structure type, set it to NO_SCORE (-1)
export function getAssessmentScoreValue(
  studentScores: SubjectRecordScoreRow[],
  assessmentStructureId: string,
): number {
  const entry = studentScores.find(
    (score) => score.assessmentStructureId === assessmentStructureId,
  );
  return entry?.score ?? NO_SCORE;
}

// Sum scores across the full assessment structure; returns NO_SCORE if any component is missing.
export function getStudentTotalFromScores(
  studentScores: SubjectRecordScoreRow[],
  assessmentStructure: AssessmentStructure[] = [],
): number {
  if (!assessmentStructure.length) return NO_SCORE;

  let total = 0;
  for (const structure of assessmentStructure) {
    const value = getAssessmentScoreValue(studentScores, structure.id);
    if (value === NO_SCORE) return NO_SCORE;
    total += value;
  }
  return total;
}

// Filter the students by their enrollment status
export const getEnrolledStudents = (
  students: SubjectRecordStudentRow[],
): SubjectRecordStudentRow[] => {
  return (students ?? []).filter((student) => student.enrolled);
};

// Get the scores and total score for a student
// Eg, {
//   ca: 30,      // per assessment type (lowercase key from structure.type)
//   exam: 50,
//   project: 20,
//   total: 100   // sum of all individual scores above
// }
export const getStudentScores = (
  student: SubjectRecordStudentRow | null,
  assessmentStructure: AssessmentStructure[] = [],
): Record<string, number> => {
  // When no scores are available, return a record with total score set to -1 and each assessment type score set to -1
  const emptyScores = (): Record<string, number> => {
    const result: Record<string, number> = { total: NO_SCORE };
    (assessmentStructure || []).forEach((assessment) => {
      result[assessment.type.toLowerCase()] = NO_SCORE;
    });
    return result;
  };

  // If no student is provided, return the empty scores record
  if (!student) return emptyScores();

  // Otherwise, build per-type scores and a total (NO_SCORE when any component is missing)
  const scores: Record<string, number> = { total: 0 };
  let missingCols = 0;

  (assessmentStructure || []).forEach((structure) => {
    const key = structure.type.toLowerCase();
    const scoreValue = getAssessmentScoreValue(student.scores, structure.id);
    scores[key] = scoreValue;
    if (scoreValue === NO_SCORE) {
      missingCols += 1;
    } else {
      scores.total += scoreValue;
    }
  });
  // If all assessment type scores are missing, set the total score to NO_SCORE (-1)
  if (missingCols === assessmentStructure.length) {
    scores.total = NO_SCORE;
  }
  return scores;
};

// Calculate the average, minimum, and maximum scores for a subject
export const calculateSubjectStats = (
  enrolledStudents: SubjectRecordStudentRow[],
  assessmentStructure: AssessmentStructure[] = [],
): { average: number; minimum: number; maximum: number } | null => {
  // If no enrolled students, return null
  if (!enrolledStudents || enrolledStudents.length === 0) {
    return null;
  }

  // Get the total scores for each enrolled student
  const totals = enrolledStudents.map((student) =>
    getStudentScores(student, assessmentStructure).total,
  );

  const validTotals = totals.filter((total) => total !== NO_SCORE);
  if (validTotals.length === 0) {
    return {
      average: NO_SCORE,
      minimum: NO_SCORE,
      maximum: NO_SCORE,
    };
  }

  const sum = validTotals.reduce((acc, score) => acc + score, 0);
  const average = sum / validTotals.length;
  const minimum = Math.min(...validTotals);
  const maximum = Math.max(...validTotals);

  return {
    average: Math.round(average * 100) / 100,
    minimum: Math.round(minimum * 100) / 100,
    maximum: Math.round(maximum * 100) / 100,
  };
};


type SubjectViewUser = {
  id?: string;
  role?: string;
  twoFactorEnabled?: boolean | null;
  emailVerified?: boolean | null;
} | null | undefined;

// define verification status for a user (extends beyond BA's verification to include role and 2fa status)
const isVerifiedTeacher = (user: SubjectViewUser): boolean =>
  user?.role === "user" || user?.role === "orgadmin" &&
  !(user?.twoFactorEnabled === true) &&
  user?.emailVerified === true;

// function to determine if the user can lock/unlock this component
// User is verified, 2fa authenticated, and is the form teacher of the selected class
export const getCanLockUnlock = (
  user: SubjectViewUser,
  selectedClassId: string | null,
  assignmentRows: TeacherSubjectAssignmentRow[],
): boolean => {
  // user is not verified, not authenticated, or has no selected class
  if (!isVerifiedTeacher(user) || !user?.id || !selectedClassId) {
    return false;
  }
  // get the selected class assignment (form teacher is the same on every row for a class)
  const selectedClassAssignment = assignmentRows.find(
    (assignment) => assignment.classId === selectedClassId,
  );
  if (!selectedClassAssignment) return false;
  // check if the user is the form teacher of the selected class
  return selectedClassAssignment.formTeacherId === user.id;
};

// function to determine if the user can edit this component
// User is verified, 2fa authenticated, and is the assigned teacher of the selected subject class assignment
export const getCanEdit = (
  user: SubjectViewUser,
  assignmentId: string | null,
  assignmentRows: TeacherSubjectAssignmentRow[],
): boolean => {
  // user is not verified, not authenticated, or has no assignment
  if (!isVerifiedTeacher(user) || !user?.id || !assignmentId) {
    return false;
  }
  // get the selected assignment
  const selectedAssignment = assignmentRows.find(
    (assignment) => assignment.assignmentId === assignmentId,
  );
  if (!selectedAssignment) return false;
  // check if the user is the assigned teacher of the selected assignment
  return selectedAssignment.assignedTeacherId === user.id;
};