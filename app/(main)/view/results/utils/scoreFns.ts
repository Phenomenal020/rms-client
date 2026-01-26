// Type definitions
interface AssessmentScore {
  assessmentStructureId: string;
  score: number;
}

interface Assessment {
  scores?: AssessmentScore[];
}

interface SubjectWithAssessment {
  assessments?: Assessment[];
}

interface AssessmentStructure {
  id: string;
  type: string;
  percentage?: number;
  order?: number;
}

interface StudentSubject extends SubjectWithAssessment {
  subjectId: string;
  subject?: {
    name: string;
  };
}

interface Student {
  id?: string;
  subjects?: StudentSubject[];
}

interface StudentStats {
  totalMarks: number;
  maxPossibleMarks: number;
  average: number;
  overallGrade: string | null;
  totalStudents: number;
  overallRemark: string | null;
}

// Helper function to get scores for each subject for one student - the selected student
// Uses assessment structure percentages from database to calculate weighted total
export const getSubjectScores = (
  subject: SubjectWithAssessment,
  assessmentStructure: AssessmentStructure[] = []
): Record<string, number> => {
  // Scores live under the subject's single assessment entry
  const assessment = subject?.assessments?.[0];
  const scores: Record<string, number> = { total: 0 };

  // Loop through the assessment structure and get the scores for each assessment type
  assessmentStructure.forEach((structure) => {
    const scoreEntry = assessment?.scores?.find(
      (s) => s.assessmentStructureId === structure.id
    );
    const score = Number(scoreEntry?.score ?? 0);
    scores[structure.type.toLowerCase()] = score;
    scores.total += score;
  });

  return scores;
};

// Calculate student statistics - performance summary component including total marks, average, etc for one student
export const calculateStudentStats = (
  student: Student | null,
  students: Student[],
  assessmentStructure: AssessmentStructure[],
  getOverallGrade: (percentage: number) => string | null,
  getOverallRemark: (grade: string | null) => string | null
): StudentStats | null => {
  if (!student || !student.subjects || student.subjects.length === 0)
    return null;

  const subjectScores = student.subjects.map((subject) =>
    getSubjectScores(subject, assessmentStructure)
  );
  const totals = subjectScores.map((score) => score.total);
  const totalMarks = totals.reduce((sum, score) => sum + score, 0);
  const maxPossibleMarks = student.subjects.length * 100;
  const average = totalMarks / student.subjects.length;
  const overallGrade = getOverallGrade(average);
  const overallRemark = getOverallRemark(overallGrade);

  return {
    totalMarks,
    maxPossibleMarks,
    average: Math.round(average * 100) / 100,
    overallGrade,
    totalStudents: students.length,
    overallRemark,
  };
};

// Helper function to get the total score percentage for a student
export const getScorePercentage = (scores: AssessmentScore[] | null | undefined): number => {
  // Sum the numeric score values; defaults to 0 when scores are missing
  return (scores || []).reduce(
    (sum, { score = 0 }) => sum + Number(score || 0),
    0
  );
};