export const StudentStats = ({ studentStats }) => {
  return <div className="grid grid-cols-2 gap-6 mb-8">

    {/* left side */}
    <div className="space-y-1">
      {/* Performance Summary Header Text */}
      <h4 className="text-lg font-bold text-gray-800  border-gray-300 pb-2">
        PERFORMANCE SUMMARY
      </h4>
      {/* Performance Summary Content */}
      <div className="space-y-2">
        {/* Total Marks Obtained: */}
        <div className="flex justify-between">
          <span className="text-gray-700">
            Total Marks Obtained:
          </span>
          <span className="font-semibold text-gray-900">
            {studentStats.totalMarks}/
            {studentStats.maxPossibleMarks}
          </span>
        </div>
        
        {/* Average Score: */}
        <div className="flex justify-between">
          <span className="text-gray-700">Average Score:</span>
          <span className="font-semibold text-gray-900">
            {studentStats.average}%
          </span>
        </div>
      </div>
    </div>

    {/* right side */}
    <div className="space-y-1">
      <h4 className="text-lg font-bold text-gray-800 border-gray-300 pb-2">
        CLASS POSITION
      </h4>
      <div className="space-y-2">
        {/* Overall Grade: */}
        <div className="flex justify-between">
          <span className="text-gray-700">Overall Grade:</span>
          <span className="font-bold text-lg text-gray-900">
            {studentStats.overallGrade}
          </span>
        </div>
        {/* Remark: */}
        <div className="flex justify-between">
          <span className="text-gray-700">Remark:</span>
          <span className="font-semibold text-gray-900">{studentStats.overallRemark}</span>
        </div>

      </div>
    </div>

  </div>
}