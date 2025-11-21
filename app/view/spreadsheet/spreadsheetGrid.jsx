import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { getGrade, getRemark } from "@/data/gradingSystem";

// Helper function to get subject code (first 3 uppercase characters)
const getSubjectCode = (subjectName) => {
  if (!subjectName) return "";
  return subjectName.substring(0, 3).toUpperCase();
};

// Helper function to get scores for a student in a subject
const getStudentScores = (student, subjectName) => {
  if (!student || !student.subjects || !subjectName) {
    return { ca: 0, exam: 0, total: 0 };
  }

  const studentSubject = student.subjects.find((s) => s.name === subjectName);

  if (!studentSubject || !studentSubject.scores) {
    return { ca: 0, exam: 0, total: 0 };
  }

  const caScore = studentSubject.scores.find((s) => s.type === "CA")?.score || 0;
  const examScore = studentSubject.scores.find((s) => s.type === "Exam")?.score || 0;

  return {
    ca: caScore,
    exam: examScore,
    total: caScore + examScore,
  };
};

export const SpreadsheetGrid = ({
  students = [],
  subjects = [],
  onCellEdit,
  onAddStudent,
  onAddSubject,
}) => {
  const [editingCell, setEditingCell] = useState(null); // { studentId, subjectName, type }

  const handleCellClick = (studentId, subjectName, type) => {
    if (type === "CA" || type === "Exam") {
      setEditingCell({ studentId, subjectName, type });
    }
  };

  const handleCellChange = (studentId, subjectName, type, value) => {
    const numValue = parseInt(value) || 0;
    onCellEdit(studentId, subjectName, type, numValue);
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleCellKeyDown = (e, studentId, subjectName, type) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      handleCellBlur();
    }
  };

  return (
    <div className="overflow-x-auto border border-gray-300 rounded-lg">
      <table className="w-full border-collapse bg-white">
        <thead>
          {/* First Header Row - Subject Codes */}
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            {/* Student Name Column - spans 2 rows */}
            <th
              rowSpan={2}
              className="border border-gray-300 p-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[150px]"
            >
              Student Name
            </th>

            {/* Subject Code Headers - each spans 5 columns (CA, Exam, Total, Grade, Remark) */}
            {subjects.map((subject) => {
              const code = getSubjectCode(subject);
              return (
                <th
                  key={subject}
                  colSpan={5}
                  className="border border-gray-300 p-2 text-center font-semibold text-gray-700 bg-gray-50"
                >
                  {code}
                </th>
              );
            })}

            {/* Add Subject Button Column - spans 2 rows */}
            <th
              rowSpan={2}
              className="border border-gray-300 p-2 text-center bg-gray-50"
            >
              <Button
                onClick={onAddSubject}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Subject
              </Button>
            </th>
          </tr>

          {/* Second Header Row - Column Names */}
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            {/* For each subject, show: CA, Exam, Total, Grade, Remark */}
            {subjects.map((subject) => (
              <React.Fragment key={subject}>
                <th className="border border-gray-300 p-2 text-center font-semibold text-gray-700 min-w-[80px]">
                  CA
                </th>
                <th className="border border-gray-300 p-2 text-center font-semibold text-gray-700 min-w-[80px]">
                  Exam
                </th>
                <th className="border border-gray-300 p-2 text-center font-semibold text-gray-700 min-w-[80px]">
                  Total
                </th>
                <th className="border border-gray-300 p-2 text-center font-semibold text-gray-700 min-w-[60px]">
                  Grade
                </th>
                <th className="border border-gray-300 p-2 text-center font-semibold text-gray-700 min-w-[100px]">
                  Remark
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Student Rows */}
          {students.map((student) => (
            <tr key={student._id} className="hover:bg-gray-50">
              {/* Student Name Cell */}
              <td className="border border-gray-300 p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">
                {student.name}
              </td>

              {/* Subject Cells for this Student */}
              {subjects.map((subject) => {
                const scores = getStudentScores(student, subject);
                const grade = getGrade(scores.total);
                const remark = getRemark(grade);
                const isEditingCA = editingCell?.studentId === student._id &&
                  editingCell?.subjectName === subject &&
                  editingCell?.type === "CA";
                const isEditingExam = editingCell?.studentId === student._id &&
                  editingCell?.subjectName === subject &&
                  editingCell?.type === "Exam";

                return (
                  <React.Fragment key={subject}>
                    {/* CA Cell */}
                    <td className="border border-gray-300 p-1 text-center">
                      {isEditingCA ? (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={scores.ca}
                          onChange={(e) =>
                            handleCellChange(student._id, subject, "CA", e.target.value)
                          }
                          onBlur={handleCellBlur}
                          onKeyDown={(e) => handleCellKeyDown(e, student._id, subject, "CA")}
                          className="w-full h-8 text-center text-sm"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="p-2 cursor-pointer hover:bg-gray-100 rounded"
                          onClick={() => handleCellClick(student._id, subject, "CA")}
                        >
                          {scores.ca}
                        </div>
                      )}
                    </td>

                    {/* Exam Cell */}
                    <td className="border border-gray-300 p-1 text-center">
                      {isEditingExam ? (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={scores.exam}
                          onChange={(e) =>
                            handleCellChange(student._id, subject, "Exam", e.target.value)
                          }
                          onBlur={handleCellBlur}
                          onKeyDown={(e) => handleCellKeyDown(e, student._id, subject, "Exam")}
                          className="w-full h-8 text-center text-sm"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="p-2 cursor-pointer hover:bg-gray-100 rounded"
                          onClick={() => handleCellClick(student._id, subject, "Exam")}
                        >
                          {scores.exam}
                        </div>
                      )}
                    </td>

                    {/* Total Cell (calculated) */}
                    <td className="border border-gray-300 p-2 text-center font-semibold text-gray-900">
                      {scores.total}
                    </td>

                    {/* Grade Cell (calculated) */}
                    <td className="border border-gray-300 p-2 text-center font-bold text-gray-900">
                      {grade}
                    </td>

                    {/* Remark Cell (calculated) */}
                    <td className="border border-gray-300 p-2 text-center text-gray-700">
                      {remark}
                    </td>
                  </React.Fragment>
                );
              })}

              {/* Empty cell for Add Subject column */}
              <td className="border border-gray-300 p-2"></td>
            </tr>
          ))}

          {/* Add Student Row */}
          <tr className="bg-gray-50">
            <td className="border border-gray-300 p-2 sticky left-0 bg-gray-50 z-10">
              <Button
                onClick={onAddStudent}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Student
              </Button>
            </td>
            {/* Empty cells for all subject columns (5 cells per subject: CA, Exam, Total, Grade, Remark) */}
            {subjects.map((subject) => (
              <React.Fragment key={subject}>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
              </React.Fragment>
            ))}
            {/* Empty cell for Add Subject column */}
            <td className="border border-gray-300 p-2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

