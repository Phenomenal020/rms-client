// Type definitions
interface GradingSystemEntry {
  id?: string;
  grade: string;
  minScore: number;
  maxScore: number;
  remark?: string | null;
}

interface GradingFunctions {
  getGrade: (percentage: number) => string | null;
  getRemark: (grade: string | null) => string | null;
  getOverallGrade: (percentage: number) => string | null;
  getOverallRemark: (overallGrade: string | null) => string | null;
}

export default function createGradingFunctions(
  gradingSystem: GradingSystemEntry[] | null | undefined
): GradingFunctions {
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
  const getGrade = (percentage: number): string | null => {
    for (const grade of sortedGrades) {
      if (percentage >= grade.minScore && percentage <= grade.maxScore) {
        return grade.grade;
      }
    }
    // If no grade is found, return "N/A"
    return "N/A";
  };

  //2. Get the remark for a given grade or null if no remark is found
  const getRemark = (grade: string | null): string | null => {
    if (!grade) return null;
    const gradeEntry = gradingSystem.find((g) => g.grade === grade);
    return gradeEntry?.remark || null;
  };

  //3. Get the overall grade for a given percentage
  const getOverallGrade = (percentage: number): string | null => {
    return getGrade(percentage);
  };

  //4. use the overall grade to get the overall remark for a given grade or null if no remark is found
  const getOverallRemark = (overallGrade: string | null): string | null => {
    return getRemark(overallGrade);
  };

  return { getGrade, getRemark, getOverallGrade, getOverallRemark };
}
