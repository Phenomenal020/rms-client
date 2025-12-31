import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Edit3, Save, X } from "lucide-react";

export const SubjectResultTable = ({
    isEditingScores,
    startEditingScores,
    saveScoreChanges,
    cancelEditingScores,
    editingStudents = [],
    enrolledStudents = [],
    selectedSubject = "",
    handleScoreChange,
    getStudentScores,
    getGrade,
    getRemark,
    assessmentStructure = [],
}) => {
    // Use editing students if editing, otherwise use enrolled students
    const students = isEditingScores ? editingStudents : enrolledStudents;

    // Use assessment structure in the order it was added (preserve database order)
    const sortedAssessments = assessmentStructure || [];

    return (
        <div className="mb-8">

            {/* Academic Performance Title and Edit Scores Button */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 border-gray-300 pb-2">
                    ACADEMIC PERFORMANCE
                </h3>
                {/* Edit Scores Button */}
                {!isEditingScores ? (
                    <Button
                        onClick={startEditingScores}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Scores
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        {/* Save Scores Button */}
                        <Button
                            onClick={saveScoreChanges}
                            size="sm"
                            className="bg-gray-800 hover:bg-gray-900 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        {/* Cancel Scores Button */}
                        <Button
                            onClick={cancelEditingScores}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* Result Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    {/* Table headers - dynamically generated from assessment structure */}
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">
                                Student Name
                            </th>
                            {sortedAssessments.map((assessment) => (
                                <th
                                    key={assessment.type}
                                    className="border border-gray-300 p-3 text-center font-semibold text-gray-700"
                                >
                                    {assessment.type} ({assessment.percentage}%)
                                </th>
                            ))}
                            <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                                Total (100%)
                            </th>
                            <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                                Grade
                            </th>
                            <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                                Remark
                            </th>
                        </tr>
                    </thead>

                    {/* Table body - students and corresponding scores, grade, remark */}
                    <tbody>
                        {students && students.length > 0 ? (
                            students.map((student, index) => {
                                // Get scores from student for the selected subject
                                const score = getStudentScores(selectedSubject, student, assessmentStructure);
                                // Compute percentage, grade and remark
                                const percentage = score.total; // Already out of 100
                                const grade = getGrade(percentage);
                                const remark = getRemark(grade);

                                return (
                                    <tr key={student.studentId || index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-3 font-medium text-gray-900">
                                            {student.name}
                                        </td>

                                        {/* Dynamically render assessment type columns */}
                                        {sortedAssessments.map((assessment) => {
                                            const assessmentType = assessment.type;
                                            const scoreKey = assessmentType.toLowerCase();
                                            const scoreValue = score[scoreKey] || 0;

                                            return (
                                                <td
                                                    key={assessmentType}
                                                    className="border border-gray-300 p-3 text-center"
                                                >
                                                    {isEditingScores ? (
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={scoreValue}
                                                            onChange={(e) =>
                                                                handleScoreChange(
                                                                    index,
                                                                    assessmentType,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-16 h-8 text-center text-sm border-gray-200 focus:border-gray-400"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">{scoreValue}</span>
                                                    )}
                                                </td>
                                            );
                                        })}

                                        {/* Total score */}
                                        <td className="border border-gray-300 p-3 text-center font-semibold text-gray-900">
                                            {score.total}
                                        </td>

                                        {/* Grade */}
                                        <td className="border border-gray-300 p-3 text-center font-bold text-gray-900">
                                            {grade}
                                        </td>

                                        {/* Remark */}
                                        <td className="border border-gray-300 p-3 text-center text-gray-700">
                                            {remark}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={sortedAssessments.length + 4} className="border border-gray-300 p-3 text-center text-gray-500">
                                    No students enrolled in this subject
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    )
}

