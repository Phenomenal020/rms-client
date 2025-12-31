import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

// Helper function to get subject code (smarter abbreviation)
const getSubjectCode = (subjectName) => {
  if (!subjectName) return "";
  
  // If subject name is short (12 chars or less), use it as is
  if (subjectName.length <= 12) {
    return subjectName;
  }
  
  // Try to get the first word if it's meaningful (4-15 chars)
  const firstWord = subjectName.split(/\s+/)[0];
  if (firstWord.length >= 4 && firstWord.length <= 15) {
    return firstWord;
  }
  
  // Try to get first two words if combined they're reasonable
  const words = subjectName.split(/\s+/);
  if (words.length >= 2) {
    const twoWords = `${words[0]} ${words[1]}`;
    if (twoWords.length <= 15) {
      return twoWords;
    }
  }
  
  // Otherwise, use first 12 characters with ellipsis if needed
  return subjectName.substring(0, 12);
};

// Helper function to get scores for a student in a subject
const getStudentScores = (student, subjectName, assessmentStructure = []) => {
  if (!student || !student.subjects || !subjectName) {
    return { isEnrolled: false, total: null };
  }

  const studentSubject = student.subjects.find((s) => s.name === subjectName);

  // Check if student is enrolled in this subject
  if (!studentSubject) {
    return { isEnrolled: false, total: null };
  }

  // Student is enrolled, get their scores
  const scores = { isEnrolled: true, total: 0 };
  
  assessmentStructure.forEach((assessment) => {
    const assessmentType = assessment.type;
    const scoreEntry = studentSubject.scores?.find((s) => s.type === assessmentType);
    const score = scoreEntry?.score || 0;
    scores[assessmentType.toLowerCase()] = score;
    scores.total += score;
  });

  return scores;
};

export const SpreadsheetGrid = ({
  students = [],
  subjects = [],
  assessmentStructure = [],
  onCellEdit,
  onAddStudent,
  onAddSubject,
  getGrade,
  getRemark,
}) => {
  const [editingCell, setEditingCell] = useState(null); // { studentId, subjectName, type }
  const scrollContainerRef = useRef(null);
  const firstSubjectHeaderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [subjectColumnWidth, setSubjectColumnWidth] = useState(0);

  // Use assessment structure in the order it was added (preserve database order)
  const sortedAssessments = assessmentStructure || [];

  // Calculate subject column width based on column count and estimated widths
  // Each assessment column: ~100px, Total: ~80px, Grade: ~60px, Remark: ~100px
  const calculateSubjectWidth = () => {
    const assessmentCols = sortedAssessments.length * 100; // ~100px per assessment column
    const totalCol = 80;
    const gradeCol = 60;
    const remarkCol = 100;
    return assessmentCols + totalCol + gradeCol + remarkCol;
  };

  // Measure subject column width from the actual DOM
  useEffect(() => {
    const measureWidth = () => {
      if (firstSubjectHeaderRef.current && subjects.length > 0) {
        const width = firstSubjectHeaderRef.current.offsetWidth;
        if (width > 0) {
          setSubjectColumnWidth(width);
        } else {
          // Fallback to calculated width if measurement fails
          setSubjectColumnWidth(calculateSubjectWidth());
        }
      } else if (subjects.length > 0) {
        // Fallback to calculated width
        setSubjectColumnWidth(calculateSubjectWidth());
      }
    };

    // Measure after DOM is ready
    const timeoutId = setTimeout(measureWidth, 150);
    
    // Also measure on resize
    window.addEventListener('resize', measureWidth);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measureWidth);
    };
  }, [subjects, sortedAssessments.length]);

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px threshold
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [subjects, sortedAssessments.length]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = subjectColumnWidth > 0 ? subjectColumnWidth : calculateSubjectWidth();
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = subjectColumnWidth > 0 ? subjectColumnWidth : calculateSubjectWidth();
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCellClick = (studentId, subjectName, type) => {
    // Allow editing for any assessment type
    setEditingCell({ studentId, subjectName, type });
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
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Subject
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={scrollRight}
          disabled={!canScrollRight}
          className="flex items-center gap-2"
        >
          Next Subject
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto border border-gray-300 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ maxWidth: '100%' }}
      >
        <table className="border-collapse bg-white" style={{ tableLayout: 'auto', width: 'max-content' }}>
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

            {/* Subject Code Headers - each spans (assessment types + Total + Grade + Remark) columns */}
            {subjects.map((subject, index) => {
              const code = getSubjectCode(subject);
              const colSpan = sortedAssessments.length + 3; // assessment types + Total + Grade + Remark
              return (
                <th
                  key={subject}
                  ref={index === 0 ? firstSubjectHeaderRef : null}
                  colSpan={colSpan}
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
            {/* For each subject, show: dynamic assessment types, Total, Grade, Remark */}
            {subjects.map((subject) => (
              <React.Fragment key={subject}>
                {sortedAssessments.map((assessment) => (
                  <th
                    key={assessment.type}
                    className="border border-gray-300 p-2 text-center font-semibold text-gray-700 min-w-[80px]"
                  >
                    {assessment.type} ({assessment.percentage}%)
                  </th>
                ))}
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
            <tr key={student.studentId} className="hover:bg-gray-50">
              {/* Student Name Cell */}
              <td className="border border-gray-300 p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">
                {student.name}
              </td>

              {/* Subject Cells for this Student */}
              {subjects.map((subject, subjectIndex) => {
                const scores = getStudentScores(student, subject, assessmentStructure);
                const isEnrolled = scores.isEnrolled;
                const grade = isEnrolled ? getGrade(scores.total) : null;
                const remark = isEnrolled ? getRemark(grade) : null;

                return (
                  <React.Fragment key={subject}>
                    {/* Dynamically render assessment type columns */}
                    {sortedAssessments.map((assessment) => {
                      const assessmentType = assessment.type;
                      const scoreKey = assessmentType.toLowerCase();
                      const scoreValue = isEnrolled ? (scores[scoreKey] || 0) : null;
                      const isEditing = editingCell?.studentId === student.studentId &&
                        editingCell?.subjectName === subject &&
                        editingCell?.type === assessmentType;

                      return (
                        <td 
                          key={assessmentType} 
                          className="border border-gray-300 p-1 text-center"
                        >
                          {!isEnrolled ? (
                            <div className="p-2 text-gray-400">
                              -
                            </div>
                          ) : isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={scoreValue}
                              onChange={(e) =>
                                handleCellChange(student.studentId, subject, assessmentType, e.target.value)
                              }
                              onBlur={handleCellBlur}
                              onKeyDown={(e) => handleCellKeyDown(e, student.studentId, subject, assessmentType)}
                              className="w-full h-8 text-center text-sm"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="p-2 cursor-pointer hover:bg-gray-100 rounded"
                              onClick={() => handleCellClick(student.studentId, subject, assessmentType)}
                            >
                              {scoreValue}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Total Cell (calculated) */}
                    <td className="border border-gray-300 p-2 text-center font-semibold text-gray-900">
                      {isEnrolled ? scores.total : "-"}
                    </td>

                    {/* Grade Cell (calculated) */}
                    <td className="border border-gray-300 p-2 text-center font-bold text-gray-900">
                      {isEnrolled ? (grade || "-") : "-"}
                    </td>

                    {/* Remark Cell (calculated) */}
                    <td className="border border-gray-300 p-2 text-center text-gray-700">
                      {isEnrolled ? (remark || "-") : "-"}
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
            {/* Empty cells for all subject columns (assessment types + Total + Grade + Remark) */}
            {subjects.map((subject) => (
              <React.Fragment key={subject}>
                {sortedAssessments.map(() => (
                  <td key={Math.random()} className="border border-gray-300 p-2"></td>
                ))}
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
    </div>
  );
};

