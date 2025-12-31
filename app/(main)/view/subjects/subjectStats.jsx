export const SubjectStats = ({ subjectStats }) => {
  if (!subjectStats) return null;

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">

      {/* left side */}
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-gray-800  border-gray-300 pb-2">
          PERFORMANCE SUMMARY
        </h4>
        <div className="space-y-2">
          {/* Average Score: */}
          <div className="flex justify-between">
            <span className="text-gray-700">
              Average Score:
            </span>
            <span className="font-semibold text-gray-900">
              {subjectStats.average}%
            </span>
          </div>
          {/* Minimum Score: */}
          <div className="flex justify-between">
            <span className="text-gray-700">Minimum Score:</span>
            <span className="font-semibold text-gray-900">
              {subjectStats.minimum}%
            </span>
          </div>
        </div>
      </div>

      {/* right side */}
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-gray-800 border-gray-300 pb-2">
          CLASS STATISTICS
        </h4>
        <div className="space-y-2">
          {/* Maximum Score: */}
          <div className="flex justify-between">
            <span className="text-gray-700">Maximum Score:</span>
            <span className="font-semibold text-gray-900">
              {subjectStats.maximum}%
            </span>
          </div>
          {/* Class Average: */}
          <div className="flex justify-between">
            <span className="text-gray-700">Class Average:</span>
            <span className="font-semibold text-gray-900">
              {subjectStats.classAverage}%
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}

