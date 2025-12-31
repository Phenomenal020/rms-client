// Helper function to get scores for each subject for one student - the selected student
// Uses assessment structure percentages from database to calculate weighted total
export const getSubjectScores = (subject, assessmentStructure = []) => {
  // Get all assessment types and their scores dynamically
  const scores = { total: 0 };
  
  assessmentStructure.forEach((assessment) => {
    const assessmentType = assessment.type;
    // Find score from the subject's scores array (already transformed from AssessmentScore)
    const scoreEntry = subject.scores?.find((s) => s.type === assessmentType);
    const score = scoreEntry?.score || 0;
    scores[assessmentType.toLowerCase()] = score;
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

