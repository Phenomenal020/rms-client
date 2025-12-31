export default function createGradingFunctions(gradingSystem) {
  // If there is nothing to grade, return functions that handle missing grading system gracefully
  if (!gradingSystem || gradingSystem.length === 0) {
    return {
      getGrade: () => null,
      getRemark: () => null,
      getOverallGrade: () => null,
      getOverallRemark: () => null,
    };
  }

  //1. Get the grade for a given percentage
  const sortedGrades = [...gradingSystem].sort(
    (a, b) => b.minScore - a.minScore
  );
  const getGrade = (percentage) => {
    for (const grade of sortedGrades) {
      if (percentage >= grade.minScore && percentage <= grade.maxScore) {
        return grade.grade;
      }
    }
    // If no grade is found, return "N/A"
    return "N/A";
  };

  //2. Get the remark for a given grade or null if no remark is found
  const getRemark = (grade) => {
    const gradeEntry = gradingSystem.find((g) => g.grade === grade);
    return gradeEntry?.remark || null;
  };

  //3. Get the overall grade for a given percentage
  const getOverallGrade = (percentage) => {
    return getGrade(percentage);
  };

  //4. use the overall grade to get the overall remark for a given grade or null if no remark is found
  const getOverallRemark = (overallGrade) => {
    return getRemark(overallGrade);
  };

  return { getGrade, getRemark, getOverallGrade, getOverallRemark };
}
