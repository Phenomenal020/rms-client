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
}

export const StudentStats = ({ studentStats }: StudentStatsProps) => {
  return <div className="grid grid-cols-2 gap-6 mb-8">

    {/* left side */}
    <div className="space-y-1">
      {/* Performance Summary Header Text */}
      <h4 className="text-base md:text-lg font-bold text-gray-800  border-gray-300 pb-2">
        PERFORMANCE SUMMARY
      </h4>
      {/* Performance Summary Content */}
      <div className="space-y-2">
        {/* Total Marks Obtained: */}
        <div className="flex justify-between">
          <span className="text-gray-700 text-sm md:text-base">
            Total Marks:
          </span>
          <span className="font-semibold text-gray-900 text-sm md:text-base">
            {studentStats.totalMarks}/
            {studentStats.maxPossibleMarks}
          </span>
        </div>
        
        {/* Average Score: */}
        <div className="flex justify-between">
          <span className="text-gray-700 text-sm md:text-base">Average Score:</span>
          <span className="font-semibold text-gray-900 text-sm md:text-base">
            {studentStats.average}%
          </span>
        </div>
      </div>
    </div>

    {/* right side */}
    <div className="space-y-1">
      <h4 className="text-base md:text-lg font-bold text-gray-800 border-gray-300 pb-2">
        CLASS POSITION
      </h4>
      <div className="space-y-2">
        {/* Overall Grade: */}
        <div className="flex justify-between">
          <span className="text-gray-700 text-sm md:text-base">Overall Grade:</span>
          <span className="font-bold text-base md:text-lg text-gray-900">
            {studentStats.overallGrade}
          </span>
        </div>
        {/* Remark: */}
        <div className="flex justify-between">
          <span className="text-gray-700 text-sm md:text-base">Remark:</span>
          <span className="font-semibold text-gray-900 text-sm md:text-base">{studentStats.overallRemark}</span>
        </div>

      </div>
    </div>

  </div>
}