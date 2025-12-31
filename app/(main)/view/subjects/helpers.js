// Get students enrolled in the selected subject
export const getEnrolledStudents = (subjectName, students) => {
  if (!subjectName) return [];
  return students?.filter((student) =>
    student.subjects?.some((s) => s.name === subjectName)
  );
};

// Helper function to get scores for a student in the selected subject
// Works with AssessmentScore model structure
export const getStudentScores = (subjectName, student, assessmentStructure = []) => {
  if (!subjectName || !student || !student.subjects) {
    // Return dynamic structure based on assessment structure
    const scores = { total: 0 };
    assessmentStructure.forEach((assessment) => {
      scores[assessment.type.toLowerCase()] = 0;
    });
    return scores;
  }

  const studentSubject = student.subjects.find((s) => s.name === subjectName);

  if (!studentSubject || !studentSubject.scores) {
    // Return dynamic structure based on assessment structure
    const scores = { total: 0 };
    assessmentStructure.forEach((assessment) => {
      scores[assessment.type.toLowerCase()] = 0;
    });
    return scores;
  }

  // Build scores object dynamically from assessment structure
  const scores = { total: 0 };
  
  assessmentStructure.forEach((assessment) => {
    const assessmentType = assessment.type;
    const scoreEntry = studentSubject.scores.find((s) => s.type === assessmentType);
    const score = scoreEntry?.score || 0;
    scores[assessmentType.toLowerCase()] = score;
    scores.total += score;
  });

  return scores;
};

// Calculate subject statistics - performance summary for the selected subject
export const calculateSubjectStats = (subjectName, enrolledStudents, assessmentStructure = []) => {
  if (!subjectName || !enrolledStudents || enrolledStudents.length === 0) {
    return null;
  }

  const scores = enrolledStudents.map((student) => {
    const score = getStudentScores(subjectName, student, assessmentStructure);
    return score.total;
  });

  if (scores.length === 0) return null;

  const total = scores.reduce((sum, score) => sum + score, 0);
  const average = total / scores.length;
  const minimum = Math.min(...scores);
  const maximum = Math.max(...scores);

  return {
    average: Math.round(average * 100) / 100,
    minimum: Math.round(minimum * 100) / 100,
    maximum: Math.round(maximum * 100) / 100,
    classAverage: Math.round(average * 100) / 100, // Same as average in this context
  };
};
