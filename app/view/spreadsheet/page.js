"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Save, Printer } from "lucide-react";
import { toast } from "sonner";

// data
import { studentsData } from "@/data/students_placeholder";

// components
import { SpreadsheetGrid } from "./spreadsheetGrid";
import { AddStudentDialog } from "./addStudentDialog";
import { AddSubjectDialog } from "./addSubjectDialog";

const SpreadsheetPage = () => {
  // students state
  const [students, setStudents] = useState(studentsData);

  // Extract unique subjects from students data using a set to avoid duplicates
  const extractUniqueSubjects = (studentsList) => {
    const subjectSet = new Set();
    studentsList.forEach((student) => {
      if (student.subjects && student.subjects.length > 0) {
        student.subjects.forEach((subject) => {
          if (!subjectSet.has(subject.name)) {
            subjectSet.add(subject.name);
          }
        });
      }
    });
    return Array.from(subjectSet);
  };

  // Memoize subjects list
  const subjects = useMemo(
    () => extractUniqueSubjects(students),
    [students]
  );

  // Dialog states
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isAddSubjectDialogOpen, setIsAddSubjectDialogOpen] = useState(false);

  // Calculate next student ID
  const nextStudentId = useMemo(() => {
    if (students.length === 0) return 1;
    const maxId = Math.max(...students.map((s) => s._id || 0));
    return maxId + 1;
  }, [students]);

  // -------------------------------------------------------------------

  // Handle cell edit (CA or Exam score)
  const handleCellEdit = (studentId, subjectName, scoreType, value) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student._id === studentId) {
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
    toast.success(`Student "${studentData.name}" added successfully!`);
  };

  // -------------------------------------------------------------------

  // Handle add new subject
  const handleAddSubject = (subjectData) => {
    const { name, caDefault, examDefault } = subjectData;

    // Add the subject to all students with default scores if provided
    setStudents((prev) =>
      prev.map((student) => {
        const updatedSubjects = student.subjects ? [...student.subjects] : [];

        // Check if subject already exists
        const subjectExists = updatedSubjects.some((s) => s.name === name);
        if (!subjectExists) {
          const newSubject = {
            name: name,
            scores: [],
          };

          // Add default scores if provided
          if (caDefault !== undefined && caDefault !== null) {
            newSubject.scores.push({ type: "CA", score: caDefault });
          }
          if (examDefault !== undefined && examDefault !== null) {
            newSubject.scores.push({ type: "Exam", score: examDefault });
          }

          updatedSubjects.push(newSubject);
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
            onCellEdit={handleCellEdit}
            onAddStudent={() => setIsAddStudentDialogOpen(true)}
            onAddSubject={() => setIsAddSubjectDialogOpen(true)}
          />
        </div>

        {/* Add Student Dialog */}
        <AddStudentDialog
          open={isAddStudentDialogOpen}
          onOpenChange={setIsAddStudentDialogOpen}
          onSave={handleAddStudent}
          nextStudentId={nextStudentId}
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

