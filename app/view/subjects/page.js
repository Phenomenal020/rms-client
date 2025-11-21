"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

// data
import { studentsData } from "@/data/students_placeholder";
import { schoolData } from "@/data/school_placeholder";
import { getGrade, getRemark } from "@/data/gradingSystem";

// components
import { SubjectStats } from "./subjectStats";
import { SubjectInfo } from "./subjectInfo";
import { SchoolHeader } from "@/app/view/results/schoolHeader";
import { SubjectResultTable } from "./subjectResultTable";
import { SubjectSelection } from "./subjectSelection";

// helpers
import {
  calculateSubjectStats,
  getStudentScores,
  getEnrolledStudents,
} from "./helpers";

const SubjectsPage = () => {
  // students state
  const [students, setStudents] = useState(studentsData); // students data from db

  // Extract unique subjects from students data using a set to avoid duplicates.
  const extractUniqueSubjects = useMemo(
    () => (studentsList) => {
      const subjectSet = new Set();
      // loop through each student and their subjects
      studentsList.forEach((student) => {
        if (student.subjects && student.subjects.length > 0) {
          student.subjects.forEach((subject) => {
            // if the subject is not in the subject set, add it
            if (!subjectSet.has(subject.name)) {
              subjectSet.add(subject.name);
            }
          });
        }
      });
      return Array.from(subjectSet);
    },
    [studentsData]
  );

  // Initialise subjects state with unique subjects from students data
  const [subjects] = useState(extractUniqueSubjects(studentsData));
  // Initialise selected subject state with the first subject from subjects state
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || null);
  // Initialise current subject index state with 0
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);

  // Memoise this operation to get enrolled students for the selected subject
  const enrolledStudents = useMemo(
    () =>
      selectedSubject ? getEnrolledStudents(selectedSubject, students) : [],
    [selectedSubject, students]
  );

  // editing states
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editingSubjectData, setEditingSubjectData] = useState({});
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editingStudents, setEditingStudents] = useState([]);

  // school state
  const [school, setSchool] = useState(schoolData); // to render schoolHeader data
  const [editingSchoolData, setEditingSchoolData] = useState({});

  // Update selected subject when subjects change
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
      setCurrentSubjectIndex(0);
    }
  }, [subjects, selectedSubject]);

  // -------------------------------------------------------------------

  // Memoise the derived subject stats
  const subjectStats = useMemo(
    () =>
      selectedSubject
        ? calculateSubjectStats(selectedSubject, enrolledStudents)
        : null,
    [selectedSubject, enrolledStudents]
  );

  // -------------------------------------------------------------------

  // Previous subject - decrease the current subject index by 1
  const goToPreviousSubject = () => {
    if (currentSubjectIndex > 0 && subjects.length > 0) {
      const newIndex = currentSubjectIndex - 1;
      setCurrentSubjectIndex(newIndex);
      setSelectedSubject(subjects[newIndex]);
    }
  };

  // Next subject - increase the current subject index by 1
  const goToNextSubject = () => {
    if (currentSubjectIndex < subjects.length - 1 && subjects.length > 0) {
      const newIndex = currentSubjectIndex + 1;
      setCurrentSubjectIndex(newIndex);
      setSelectedSubject(subjects[newIndex]);
    }
  };

  // -------------------------------------------------------------------

  // Edit functions - start editing subject data
  const startEditingSubject = () => {
    setEditingSubjectData({ name: selectedSubject });
    setIsEditingSubject(true);
  };

  // Edit functions - cancel editing subject data
  const cancelEditingSubject = () => {
    setEditingSubjectData({});
    setIsEditingSubject(false);
  };

  // Edit functions - save editing subject data (This operation is expensive with embedded data in mongodb BUT this wont happen often, so its fine)
  const saveSubjectChanges = () => {
    // Update subject name in all students' subjects
    if (editingSubjectData.name !== selectedSubject) {
      setStudents((prev) =>
        prev.map((student) => {
          if (student.subjects) {
            return {
              ...student,
              subjects: student.subjects.map((s) =>
                s.name === selectedSubject
                  ? { ...s, name: editingSubjectData.name }
                  : s
              ),
            };
          }
          return student;
        })
      );
    }
    // Update selected subject to the new subject name
    setSelectedSubject(editingSubjectData.name);
    setIsEditingSubject(false);
  };

  // -------------------------------------------------------------------

  // Edit functions - start editing scores
  const startEditingScores = () => {
    setEditingStudents(enrolledStudents.map((student) => ({ ...student })));
    setIsEditingScores(true);
  };

  // Edit functions - cancel editing scores
  const cancelEditingScores = () => {
    setEditingStudents([]);
    setIsEditingScores(false);
  };

  // Edit functions - save editing scores
  const saveScoreChanges = () => {
    setStudents((prev) =>
      prev.map((student) => {
        const editedStudent = editingStudents.find(
          (es) => es._id === student._id
        );
        if (editedStudent) {
          return editedStudent;
        }
        return student;
      })
    );
    setIsEditingScores(false);
  };

  // Edit functions - handle score change
  const handleScoreChange = (studentIndex, scoreType, value) => {
    const numValue = parseInt(value) || 0;
    setEditingStudents((prev) => {
      const newStudents = [...prev];
      const student = { ...newStudents[studentIndex] };

      // Find the subject in the student's subjects array
      const subjectIndex = student.subjects.findIndex(
        (s) => s.name === selectedSubject
      );

      if (subjectIndex >= 0) {
        const subject = { ...student.subjects[subjectIndex] };

        // Update or create scores array if not already present
        if (!subject.scores) {
          subject.scores = [];
        }

        // Find existing score of this type or create new one if not found
        const scoreIndex = subject.scores.findIndex(
          (s) => s.type === scoreType
        );
        if (scoreIndex >= 0) {
          subject.scores[scoreIndex] = { type: scoreType, score: numValue };
        } else {
          subject.scores.push({ type: scoreType, score: numValue });
        }

        // Update the subject in the student's subjects array
        student.subjects[subjectIndex] = subject;
      }

      newStudents[studentIndex] = student;
      return newStudents;
    });
  };

  // -------------------------------------------------------------------

  // Edit functions - start editing school data
  const startEditingSchool = () => {
    setEditingSchoolData({ ...school });
    setIsEditingSchool(true);
  };

  // Edit functions - cancel editing school data
  const cancelEditingSchool = () => {
    setEditingSchoolData({});
    setIsEditingSchool(false);
  };

  // Edit functions - save editing school data
  const saveSchoolChanges = () => {
    setSchool(editingSchoolData);
    setIsEditingSchool(false);
  };

  // -------------------------------------------------------------------

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export function
  const handleExport = () => {
    toast.success("Subject sheet exported successfully!");
  };

  // -------------------------------------------------------------------

  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">No subjects available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header - contains print and export buttons */}
        <Header handlePrint={handlePrint} handleExport={handleExport} />

        {/* Subject Selection - name and <- -> buttons to navigate through the subjects */}
        <SubjectSelection
          goToPreviousSubject={goToPreviousSubject}
          goToNextSubject={goToNextSubject}
          currentSubjectIndex={currentSubjectIndex}
          setCurrentSubjectIndex={setCurrentSubjectIndex}
          subjects={subjects}
          setSelectedSubject={setSelectedSubject}
          selectedSubject={selectedSubject}
        />

        {/* Subject Sheet */}
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8">
            {/* School Header */}
            <SchoolHeader
              isEditingSchool={isEditingSchool}
              startEditingSchool={startEditingSchool}
              saveSchoolChanges={saveSchoolChanges}
              cancelEditingSchool={cancelEditingSchool}
              editingSchoolData={editingSchoolData}
              setEditingSchoolData={setEditingSchoolData}
              school={school}
            />

            {/* Subject Information */}
            <SubjectInfo
              isEditingSubject={isEditingSubject}
              startEditingSubject={startEditingSubject}
              saveSubjectChanges={saveSubjectChanges}
              cancelEditingSubject={cancelEditingSubject}
              editingSubjectData={editingSubjectData}
              setEditingSubjectData={setEditingSubjectData}
              selectedSubject={selectedSubject}
              enrolledStudentsCount={enrolledStudents.length}
              term={school.term}
              academicYear={school.academicYear}
            />

            {/* Academic Performance */}
            <SubjectResultTable
              isEditingScores={isEditingScores}
              startEditingScores={startEditingScores}
              saveScoreChanges={saveScoreChanges}
              cancelEditingScores={cancelEditingScores}
              editingStudents={editingStudents}
              enrolledStudents={enrolledStudents}
              selectedSubject={selectedSubject}
              handleScoreChange={handleScoreChange}
              getStudentScores={getStudentScores}
              getGrade={getGrade}
              getRemark={getRemark}
            />

            {/* Summary Statistics */}
            {subjectStats && <SubjectStats subjectStats={subjectStats} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubjectsPage;

const Header = ({ handlePrint, handleExport }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subject Sheet</h1>
        <div className="flex gap-2">
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
            className="bg-gray-800 hover:bg-gray-900 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
