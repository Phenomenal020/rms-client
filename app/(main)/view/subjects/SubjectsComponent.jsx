"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

// components
import { SubjectStats } from "./subjectStats";
import { SubjectInfo } from "./subjectInfo";
import { SchoolHeader } from "@/app/(main)/view/results/schoolHeader";
import { SubjectResultTable } from "./subjectResultTable";
import { SubjectSelection } from "./subjectSelection";

// helpers
import {
  calculateSubjectStats,
  getStudentScores,
  getEnrolledStudents,
} from "./helpers";

// utils
import createGradingFunctions from "./utils/gradingFns";
import transformData from "./utils/transformDataFn";

const SubjectsPage = ({ user, academicTerm }) => {
  // Transform the data to format required by the component. This function does a lot of nested mapping. So, it is memoised to avoid re-calculating it unless the academic term changes.
  const transformedData = useMemo(() => transformData(user, academicTerm), [academicTerm]);
  // Likewise
  const gradingFunctions = useMemo(() => createGradingFunctions(academicTerm?.gradingSystem), [academicTerm?.gradingSystem]);

  // Extract grading functions
  const { getGrade, getRemark } = gradingFunctions;

  // students state
  const [students, setStudents] = useState(transformedData.students); // students data from db

  // subjects state
  const [subjects] = useState(transformedData.subjects);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || null); // default selected subject as the first subject
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0); // current subject index to track the current subject

  // Memoise this operation to get enrolled students for the selected subject
  const enrolledStudents = useMemo(
    () =>
      selectedSubject ? getEnrolledStudents(selectedSubject, students) : [],
    [selectedSubject, students]
  );

  // editing states: school, subject, scores
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editingSubjectData, setEditingSubjectData] = useState({});
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editingStudents, setEditingStudents] = useState([]);

  // school state
  const [schoolData, setSchoolData] = useState(transformedData.schoolData);
  const [editingSchoolData, setEditingSchoolData] = useState(null);

  // Update selected subject when subjects change
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]); // default selected subject as the first subject
      setCurrentSubjectIndex(0); // default current subject index as 0
    }
  }, [subjects, selectedSubject]);

  // Update states when transformed data changes
  useEffect(() => {
    setStudents(transformedData.students);
    setSchoolData(transformedData.schoolData);
    if (transformedData.subjects.length > 0) {
      setSelectedSubject(transformedData.subjects[0]);
      setCurrentSubjectIndex(0);
    }
  }, [transformedData]);

  // -------------------------------------------------------------------

  // Memoise the derived subject stats
  const subjectStats = useMemo(
    () =>
      selectedSubject
        ? calculateSubjectStats(selectedSubject, enrolledStudents, academicTerm?.assessmentStructure || [])
        : null,
    [selectedSubject, enrolledStudents, academicTerm?.assessmentStructure]
  );

  // -------------------------------------------------------------------

  // --------------------------------Prev/Next Subject Functions-----------------------------

  // Previous subject - decrease the current subject index by 1 and set the selected subject to the new index
  const goToPreviousSubject = () => {
    if (currentSubjectIndex > 0 && subjects.length > 0) {
      const newIndex = currentSubjectIndex - 1;
      setCurrentSubjectIndex(newIndex);
      setSelectedSubject(subjects[newIndex]);
    }
  };

  // Next subject - increase the current subject index by 1 and set the selected subject to the new index
  const goToNextSubject = () => {
    if (currentSubjectIndex < subjects.length - 1 && subjects.length > 0) {
      const newIndex = currentSubjectIndex + 1;
      setCurrentSubjectIndex(newIndex);
      setSelectedSubject(subjects[newIndex]);
    }
  };

  // --------------------------------Edit/Save Subject Functions (Subject name)-----------------------------

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

  // Edit functions - save editing subject data
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

  // --------------------------------Edit/Save Scores Functions-----------------------------

  // Edit functions - start editing scores (copy the enrolled students into the editing students state) and update isEditingScores to true to render input fields (spans when not editing, input when editing)
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
      // get the previous student data and update with the editing students
      prev.map((student) => {
        const editedStudent = editingStudents.find(
          (es) => es.studentId === student.studentId
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
      // get the previous students and update the student at the given index with the new score
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

        // update the subject at the given index with the new subject
        student.subjects[subjectIndex] = subject;
      }

      // update the student at the given index with the new student
      newStudents[studentIndex] = student;
      return newStudents;
    });
  };

  // --------------------------------Edit/Save School Information Functions-----------------------------

  // Edit functions - start editing school data
  const startEditingSchool = () => {
    setEditingSchoolData({ ...schoolData });
    setIsEditingSchool(true);
  };

  // Edit functions - cancel editing school data
  const cancelEditingSchool = () => {
    setEditingSchoolData({});
    setIsEditingSchool(false);
  };

  // Edit functions - save editing school data
  const saveSchoolChanges = () => {
    setSchoolData(editingSchoolData);
    setIsEditingSchool(false);
  };

  // -------------------------------------------------------------------

  // Todo: Handle Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Todo: Handle Export functionality
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
            {/* School Header Containing School info + save/edit functions */}
            <SchoolHeader
              isEditingSchool={isEditingSchool}
              startEditingSchool={startEditingSchool}
              saveSchoolChanges={saveSchoolChanges}
              cancelEditingSchool={cancelEditingSchool}
              editingSchoolData={editingSchoolData}
              setEditingSchoolData={setEditingSchoolData}
              school={schoolData}
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
              term={schoolData?.term}
              academicYear={schoolData?.academicYear}
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
              getStudentScores={(subjectName, student) => getStudentScores(subjectName, student, academicTerm?.assessmentStructure || [])}
              getGrade={getGrade}
              getRemark={getRemark}
              assessmentStructure={academicTerm?.assessmentStructure || []}
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
        {/* Subject Sheet Header Text */}
        <h1 className="text-2xl font-bold text-gray-900">
          Subject Sheet
        </h1>
        {/* Print and Export Buttons */}
        <div className="flex gap-2">
          {/* Print Button */}
          <Button onClick={handlePrint} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          {/* Export Button */}
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

