// Helper function to get scores for each subject for one student - the selected student
// Uses assessment structure percentages from database to calculate weighted total
export const getSubjectScores = (subject, assessmentStructure = []) => {
  // Scores live under the subject's single assessment entry
  const assessment = subject?.assessments?.[0];
  const scores = { total: 0 };

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
export const calculateStudentStats = (student, students, assessmentStructure, getOverallGrade, getOverallRemark) => {
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
export const getScorePercentage = (scores) => {
  // Sum the numeric score values; defaults to 0 when scores are missing
  return (scores || []).reduce(
    (sum, { score = 0 }) => sum + Number(score || 0),
    0
  );
};