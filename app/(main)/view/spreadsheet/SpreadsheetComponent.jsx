"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/shadcn/ui/button";
import { Download, Save, Printer } from "lucide-react";
import { toast } from "sonner";

// components
import { SpreadsheetGrid } from "./spreadsheetGrid";
import { AddStudentDialog } from "./addStudentDialog";
import { AddSubjectDialog } from "./addSubjectDialog";

// Grading functions based on user's grading system from database
const createGradingFunctions = (gradingSystem) => {
  if (!gradingSystem || gradingSystem.length === 0) {
    // Return functions that handle missing grading system gracefully
    return {
      getGrade: () => null,
      getRemark: () => null,
    };
  }

  // Sort grading system by minScore descending
  const sortedGrades = [...gradingSystem].sort((a, b) => b.minScore - a.minScore);

  const getGrade = (percentage) => {
    for (const grade of sortedGrades) {
      if (percentage >= grade.minScore && percentage <= grade.maxScore) {
        return grade.grade;
      }
    }
    return sortedGrades[sortedGrades.length - 1]?.grade || null;
  };

  const getRemark = (grade) => {
    const gradeEntry = gradingSystem.find((g) => g.grade === grade);
    return gradeEntry?.remark || null;
  };

  return { getGrade, getRemark };
};

// Transform database data to component format
const transformData = (user, academicTerm) => {
  if (!user || !academicTerm) return { students: [], subjects: [] };

  // Transform students data - students belong to academicTerm
  const students = (academicTerm.students || []).map((student) => {
    const fullName = `${student.firstName}${student.middleName ? ` ${student.middleName}` : ""} ${student.lastName}`.trim();
    
    // Transform subjects with assessments and scores
    const subjects = (student.subjects || []).map((studentSubject) => {
      // Find the assessment for this student-subject combination
      const assessment = student.assessments?.find(
        (a) => a.subjectId === studentSubject.subjectId
      ) || null;

      // Transform scores from AssessmentScore model
      const scores = assessment?.scores?.map((score) => ({
        type: score.assessmentStructure?.type || "",
        score: score.score || 0,
      })) || [];

      return {
        name: studentSubject.subject?.name || "",
        subjectId: studentSubject.subjectId,
        assessmentId: assessment?.id || null,
        scores, // Scores from AssessmentScore model
      };
    });

    return {
      name: fullName,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      studentId: student.id,
      subjects,
    };
  });

  // Extract subjects from academicTerm
  const subjects = (academicTerm.subjects || []).map((subject) => subject.name);

  return { students, subjects };
};

const SpreadsheetPage = ({ user, academicTerm }) => {
  // Transform user data to component format
  const transformedData = useMemo(() => transformData(user, academicTerm), [user, academicTerm]);
  const gradingFunctions = useMemo(() => createGradingFunctions(academicTerm?.gradingSystem), [academicTerm?.gradingSystem]);

  // Extract grading functions
  const { getGrade, getRemark } = gradingFunctions;

  // students state
  const [students, setStudents] = useState(transformedData.students);

  // Memoize subjects list
  const subjects = useMemo(
    () => transformedData.subjects,
    [transformedData.subjects]
  );

  // Dialog states
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isAddSubjectDialogOpen, setIsAddSubjectDialogOpen] = useState(false);

  // Update states when transformed data changes
  useEffect(() => {
    setStudents(transformedData.students);
  }, [transformedData]);

  // -------------------------------------------------------------------

  // Handle cell edit (score for assessment type)
  const handleCellEdit = (studentId, subjectName, scoreType, value) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.studentId === studentId) {
          const updatedSubjects = student.subjects ? [...student.subjects] : [];
          const subjectIndex = updatedSubjects.findIndex(
            (s) => s.name === subjectName
          );

          if (subjectIndex >= 0) {
            // Subject exists, update the score
            const subject = { ...updatedSubjects[subjectIndex] };
            if (!subject.scores) {
              subject.scores = [];
            }

            const scoreIndex = subject.scores.findIndex(
              (s) => s.type === scoreType
            );
            if (scoreIndex >= 0) {
              subject.scores[scoreIndex] = { type: scoreType, score: value };
            } else {
              subject.scores.push({ type: scoreType, score: value });
            }

            updatedSubjects[subjectIndex] = subject;
          } else {
            // Subject doesn't exist, create it with the score
            updatedSubjects.push({
              name: subjectName,
              scores: [{ type: scoreType, score: value }],
            });
          }

          return {
            ...student,
            subjects: updatedSubjects,
          };
        }
        return student;
      })
    );
  };

  // -------------------------------------------------------------------

  // Handle add new student
  const handleAddStudent = (studentData) => {
    setStudents((prev) => [...prev, studentData]);
    toast.success(`Student "${studentData.firstName} ${studentData.lastName}" added successfully!`);
  };

  // -------------------------------------------------------------------

  // Handle add new subject
  const handleAddSubject = (subjectData) => {
    const { name } = subjectData;

    // Add the subject to all students with empty scores
    setStudents((prev) =>
      prev.map((student) => {
        const updatedSubjects = student.subjects ? [...student.subjects] : [];

        // Check if subject already exists
        const subjectExists = updatedSubjects.some((s) => s.name === name);
        if (!subjectExists) {
          updatedSubjects.push({
            name: name,
            scores: [],
          });
        }

        return {
          ...student,
          subjects: updatedSubjects,
        };
      })
    );

    toast.success(`Subject "${name}" added successfully!`);
  };

  // -------------------------------------------------------------------

  // Handle save
  const handleSave = () => {
    // In a real app, this would save to the database
    toast.success("Spreadsheet saved successfully!");
  };

  // Handle export
  const handleExport = () => {
    toast.success("Spreadsheet exported successfully!");
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // -------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header - contains save, export, and print buttons */}
        <Header
          handleSave={handleSave}
          handleExport={handleExport}
          handlePrint={handlePrint}
        />

        {/* Spreadsheet Grid */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <SpreadsheetGrid
            students={students}
            subjects={subjects}
            assessmentStructure={academicTerm?.assessmentStructure || []}
            onCellEdit={handleCellEdit}
            onAddStudent={() => setIsAddStudentDialogOpen(true)}
            onAddSubject={() => setIsAddSubjectDialogOpen(true)}
            getGrade={getGrade}
            getRemark={getRemark}
          />
        </div>

        {/* Add Student Dialog */}
        <AddStudentDialog
          open={isAddStudentDialogOpen}
          onOpenChange={setIsAddStudentDialogOpen}
          onSave={handleAddStudent}
          availableSubjects={academicTerm?.subjects || []}
        />

        {/* Add Subject Dialog */}
        <AddSubjectDialog
          open={isAddSubjectDialogOpen}
          onOpenChange={setIsAddSubjectDialogOpen}
          onSave={handleAddSubject}
        />
      </div>
    </div>
  );
};

export default SpreadsheetPage;

const Header = ({ handleSave, handleExport, handlePrint }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Spreadsheet</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="bg-gray-800 hover:bg-gray-900 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

