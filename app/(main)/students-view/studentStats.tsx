import {
  formatScoreDisplay,
  formatStatPercent,
  NO_SCORE,
  type StudentPerformanceStats,
} from "./helpers";

interface StudentStatsProps {
  studentStats: StudentPerformanceStats;
  studentName: string;
  className?: string;
}

export function StudentStats({ studentStats, studentName, className }: StudentStatsProps) {
  const gradeDisplay =
    studentStats.average === NO_SCORE
      ? "-"
      : (studentStats.overallGrade ?? "-");

  return (
    <div className="mb-6">
      <h4 className="text-base sm:text-lg font-bold text-foreground mb-1 md:mb-2">
        PERFORMANCE SUMMARY
      </h4>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {/* Name */}
        <p className="text-sm lg:text-base">
          <span className="font-semibold text-muted-foreground">Name: </span>
          <span className="text-foreground">{studentName}</span>
        </p>

        {/* Class */}
        <p className="text-sm lg:text-base">
          <span className="font-semibold text-muted-foreground">Class: </span>
          <span className="text-foreground">{className ?? "N/A"}</span>
        </p>

        {/* Total Marks */}
        <p className="text-sm lg:text-base">
          <span className="font-semibold text-muted-foreground">Total Marks: </span>
          <span className="text-foreground">
            {formatScoreDisplay(studentStats.totalMarks)}
          </span>
        </p>

        {/* Position */}
        <p className="text-sm lg:text-base">
          <span className="font-semibold text-muted-foreground">Position: </span>
          <span className="text-foreground">N/A</span>
        </p>

        {/* Average */}
        <p className="text-sm lg:text-base">
          <span className="font-semibold text-muted-foreground">Average: </span>
          <span className="text-foreground">
            {formatStatPercent(studentStats.average)}
          </span>
        </p>

        {/* Grade */}
        <p className="text-sm lg:text-base">
          <span className="font-semibold text-muted-foreground">Grade: </span>
          <span className="text-foreground">{gradeDisplay}</span>
        </p>
      </div>
    </div>
  );
}
