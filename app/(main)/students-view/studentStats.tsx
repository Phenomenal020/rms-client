// Type definitions
interface StudentStatsProps {
  studentStats: {
    totalMarks: number;
    maxPossibleMarks: number;
    average: number;
    overallGrade: string | null;
    overallRemark: string | null;
    totalStudents?: number;
  };
  studentName: string;
  className?: string;
}

export const StudentStats = ({ studentStats, studentName, className }: StudentStatsProps) => {
  return (
    <div className="mb-6">
      {/* Header */}
      <h4 className="text-base sm:text-lg font-bold text-foreground mb-1 md:mb-2">
        PERFORMANCE SUMMARY
      </h4>

      {/* Content Grid - stacks on mobile, 2 columns on sm+ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">

        {/* Student Name */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Name: </span>
          <span className="text-foreground">{studentName}</span>
        </p>

        {/* Class */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Class: </span>
          <span className="text-foreground">{className}</span>
        </p>

        {/* Total Marks */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Total Marks: </span>
          <span className="text-foreground">{studentStats.totalMarks}</span>
        </p>

        {/* Position */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Position: </span>
          <span className="text-foreground">N/A</span>
        </p>

        {/* Average Score */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Average: </span>
          <span className="text-foreground">{studentStats.average}%</span>
        </p>

        {/* Overall Grade */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Grade: </span>
          <span className="text-foreground">{studentStats.overallGrade}</span>
        </p>

      </div>

    </div>
  );
}
