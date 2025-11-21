// Get students enrolled in the selected subject
export const getEnrolledStudents = (subjectName, students) => {
  if (!subjectName) return [];
  return students?.filter((student) =>
    student.subjects?.some((s) => s.name === subjectName)
  );
};

// Helper function to get scores for a student in the selected subject
export const getStudentScores = (subjectName, student) => {
  if (!subjectName || !student || !student.subjects) {
    return { ca: 0, exam: 0, total: 0 };
  }

  const studentSubject = student.subjects.find((s) => s.name === subjectName);

  if (!studentSubject || !studentSubject.scores) {
    return { ca: 0, exam: 0, total: 0 };
  }

  const caScore =
    studentSubject.scores.find((s) => s.type === "CA")?.score || 0;
  const examScore =
    studentSubject.scores.find((s) => s.type === "Exam")?.score || 0;

  return {
    ca: caScore,
    exam: examScore,
    total: caScore + examScore,
  };
};

// Calculate subject statistics - performance summary for the selected subject
export const calculateSubjectStats = (subjectName, enrolledStudents) => {
  if (!subjectName || !enrolledStudents || enrolledStudents.length === 0) {
    return null;
  }

  const scores = enrolledStudents.map((student) => {
    const score = getStudentScores(subjectName, student);
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
