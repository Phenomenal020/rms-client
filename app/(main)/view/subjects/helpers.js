// Get students enrolled in the selected subject
export const getEnrolledStudents = (subjectName, students) => {
  if (!subjectName) return [];

  return (students || []).filter((student) =>
    student.subjects?.some(
      (s) =>
        s.subject?.name === subjectName ||
        s.name === subjectName 
    )
  );
};

// Helper function to get scores for a student in the selected subject
// Works with AssessmentScore model structure
export const getStudentScores = (subjectName, student, assessmentStructure = []) => {


  // Return zeroed scores when inputs are missing
  const emptyScores = () => {
    const result = { total: 0 };
    (assessmentStructure || []).forEach((assessment) => {
      result[assessment.type.toLowerCase()] = 0;
    });
    return result;
  };

  if (!subjectName || !student || !student.subjects) {
    return emptyScores();
  }

  // Otherwise, find the student's subject with the selected subject name
  const studentSubject = student.subjects.find(
    (s) => s.subject?.name === subjectName || s.name === subjectName
  );

  // Then find the first assessment for the student's subject
  const assessment = studentSubject?.assessments?.[0];
  if (!studentSubject || !assessment) return emptyScores();

  // initialise scores to 0
  const scores = { total: 0 };

  // Then loop through the assessment structure and add the scores to the scores object
  (assessmentStructure || []).forEach((structure) => {
    const key = structure.type.toLowerCase();  // the key is the type of the assessment
    const entry = assessment.scores?.find(  // find the score for the assessment structure
      (score) =>
        score.assessmentStructureId === structure.id ||
        score.assessmentStructure?.type === structure.type  // by id or type
    );
    const scoreValue = entry?.score || 0;  // find the score for that entry or default to 0
    scores[key] = scoreValue;  // update the type with the score
    scores.total += scoreValue;  // update the total score
  });

  return scores;  // a dictionary of score  per assessment structure type
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
