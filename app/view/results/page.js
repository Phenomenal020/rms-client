"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

// data
import { studentsData } from "@/data/students_placeholder";
import { classData } from "@/data/class_placeholder";
import { schoolData } from "@/data/school_placeholder";
import { getGrade, getRemark, getOverallGrade, getOverallRemark } from "@/data/gradingSystem";

// components
import { Signatures } from "./signatures";
import { Comments } from "./comments";
import { StudentStats } from "./studentStats";
import { EditingStudents } from "@/app/view/results/editingStudents";
import { SchoolHeader } from "./schoolHeader";
import { ResultTable } from "./resultTable";
import { StudentSelection } from "./studentSelection";

const ResultsPage = () => {
  // students state
  const [students, setStudents] = useState(studentsData); // students data from db
  const [selectedStudent, setSelectedStudent] = useState(students[0] || null); // selected student
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0); // current student index

  // editing states
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editingStudentData, setEditingStudentData] = useState({});
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editingSubjects, setEditingSubjects] = useState([]);
  const [editingComment, setEditingComment] = useState("");
  const [isEditingComments, setIsEditingComments] = useState(false);

  // school state
  const [school, setSchool] = useState(schoolData);
  const [editingSchoolData, setEditingSchoolData] = useState({});

  // -------------------------------------------------------------------

  // Helper function to get scores for each subject for one student - the selected student
  const getSubjectScores = (subject) => {
    const caScore = subject.scores?.find((s) => s.type === "CA")?.score || 0;
    const examScore =
      subject.scores?.find((s) => s.type === "Exam")?.score || 0;
    return {
      ca: caScore,
      exam: examScore,
      total: caScore + examScore,
    };
  };

  // Calculate student statistics - performance summary component including total marks, average, etc for one student
  const calculateStudentStats = (student) => {
    if (!student || !student.subjects || student.subjects.length === 0)
      return null;

    const subjectScores = student.subjects.map((subject) =>
      getSubjectScores(subject)
    );  // 0 {ca: 28, exam: 70, total: 98}, {ca: 25, exam: 67, total: 92} 
    const totals = subjectScores.map((score) => score.total); // [98, 92]
    const totalMarks = totals.reduce((sum, score) => sum + score, 0); // 98 + 92 = 190
    const maxPossibleMarks = student.subjects.length * 100; // num subjects * 100 = 2 * 100 = 200
    const average = totalMarks / student.subjects.length; // total marks / num subjects = 190 / 2 = 95
    const overallGrade = getOverallGrade(average); // get grade based on the overall percentage = A (86-100)
    const overallRemark = getOverallRemark(overallGrade); // get remark based on the overall grade = Excellent (A)

    return {
      totalMarks,
      maxPossibleMarks,
      average: Math.round(average * 100) / 100,
      overallGrade,
      totalStudents: students.length,
      overallRemark,
    };
  };

  // Memoise the derived student stats to avoid re-calculating it unless the selected student changes
  const studentStats = useMemo(
    () =>
      selectedStudent ? calculateStudentStats(selectedStudent) : null,
    [selectedStudent, students]
  );

  // -------------------------------------------------------------------

  // Previous student - decrease the current student index by 1 and set the selected student to the new index
  const goToPreviousStudent = () => {
    if (currentStudentIndex > 0 && students.length > 0) {
      const newIndex = currentStudentIndex - 1;
      setCurrentStudentIndex(newIndex);
      setSelectedStudent(students[newIndex]);
    }
  };

  // Next student - increase the current student index by 1 and set the selected student to the new index
  const goToNextStudent = () => {
    if (currentStudentIndex < students.length - 1 && students.length > 0) {
      const newIndex = currentStudentIndex + 1;
      setCurrentStudentIndex(newIndex);
      setSelectedStudent(students[newIndex]);
    }
  };

  // -------------------------------------------------------------------

  // Edit functions - start editing student data
  const startEditingStudent = () => {
    setEditingStudentData({ ...selectedStudent });
    setIsEditingStudent(true);
  };

  // Edit functions - cancel editing student data
  const cancelEditingStudent = () => {
    setEditingStudentData({});
    setIsEditingStudent(false);
  };

  // Edit functions - save editing student data
  const saveStudentChanges = () => {
    setStudents((prev) =>
      prev.map((student) =>
        student._id === selectedStudent._id ? editingStudentData : student
      )
    );
    setSelectedStudent(editingStudentData);
    setIsEditingStudent(false);
  };

  // -------------------------------------------------------------------

  // Edit functions - start editing scores (copy the selected student's subjects into the editing subjects state) and update isEditingScores to true to render input fields (spans when not editing, input when editing)
  const startEditingScores = () => {
    setEditingSubjects(
      selectedStudent.subjects ? [...selectedStudent.subjects] : []
    );
    setIsEditingScores(true);
  };

  // Edit functions - cancel editing scores
  const cancelEditingScores = () => {
    setEditingSubjects([]);
    setIsEditingScores(false);
  };

  // Edit functions - save editing scores
  const saveScoreChanges = () => {
    setStudents((prev) =>
      // get the previous student data and update the subjects  (containing the scores)with the editing subjects
      prev.map((student) =>
        student._id === selectedStudent._id
          ? { ...student, subjects: editingSubjects }
          : student
      )
    );
    setSelectedStudent({ ...selectedStudent, subjects: editingSubjects });
    setIsEditingScores(false);
  };

  // Edit functions - handle score change
  const handleScoreChange = (subjectIndex, scoreType, value) => {
    const numValue = parseInt(value) || 0;
    setEditingSubjects((prev) => {
      // get the previous subjects and update the subject at the given index with the new score
      const newSubjects = [...prev];
      const subject = { ...newSubjects[subjectIndex] };

      // Update or create scores array if not already present
      if (!subject.scores) {
        subject.scores = [];
      }

      // Find existing score of this type or create new one if not found
      const scoreIndex = subject.scores.findIndex((s) => s.type === scoreType);
      if (scoreIndex >= 0) {
        subject.scores[scoreIndex] = { type: scoreType, score: numValue };
      } else {
        subject.scores.push({ type: scoreType, score: numValue });
      }

      // update the subject at the given index with the new subject
      newSubjects[subjectIndex] = subject;
      return newSubjects;
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

  // Edit functions - start editing comments (copy the selected student's comments into the editing comment state) and update isEditingComments to true to render input fields (span when not editing, textarea when editing)
  const startEditingComments = () => {
    setEditingComment(selectedStudent.comments || "");
    setIsEditingComments(true);
  };

  // Edit functions - cancel editing comments
  const cancelEditingComments = () => {
    setEditingComment("");
    setIsEditingComments(false);
  };

  // Edit functions - save editing comments
  const saveCommentsChanges = () => {
    setStudents((prev) =>
      prev.map((student) =>
        student._id === selectedStudent._id
          ? { ...student, comments: editingComment }
          : student
      )
    );
    setSelectedStudent({ ...selectedStudent, comments: editingComment });
    setIsEditingComments(false);
  };

  // -------------------------------------------------------------------

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export function
  const handleExport = () => {
    toast.success("Result sheet exported successfully!");
  };

  // -------------------------------------------------------------------

  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">No students available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header - contains print and export buttons */}
        <Header handlePrint={handlePrint} handleExport={handleExport} />

        {/* Student Selection - name and <- -> buttons to navigate through the students */}
        <StudentSelection
          goToPreviousStudent={goToPreviousStudent}
          goToNextStudent={goToNextStudent}
          currentStudentIndex={currentStudentIndex}
          setCurrentStudentIndex={setCurrentStudentIndex}
          students={students}
          setSelectedStudent={setSelectedStudent}
          selectedStudent={selectedStudent}
        />

        {/* Result Sheet */}
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

            {/* Student Information */}
            <EditingStudents
              isEditingStudent={isEditingStudent}
              startEditingStudent={startEditingStudent}
              saveStudentChanges={saveStudentChanges}
              cancelEditingStudent={cancelEditingStudent}
              editingStudentData={editingStudentData}
              setEditingStudentData={setEditingStudentData}
              selectedStudent={selectedStudent}
              classData={classData}
            />

            {/* Academic Performance */}
            <ResultTable
              isEditingScores={isEditingScores}
              startEditingScores={startEditingScores}
              saveScoreChanges={saveScoreChanges}
              cancelEditingScores={cancelEditingScores}
              editingSubjects={editingSubjects}
              selectedStudent={selectedStudent}
              handleScoreChange={handleScoreChange}
              getSubjectScores={getSubjectScores}
              getGrade={getGrade}
              getRemark={getRemark}
            />

            {/* Summary Statistics */}
            {studentStats && <StudentStats studentStats={studentStats} />}

            {/* Comments Section */}
            <Comments
              isEditingComments={isEditingComments}
              startEditingComments={startEditingComments}
              saveCommentsChanges={saveCommentsChanges}
              cancelEditingComments={cancelEditingComments}
              selectedStudent={selectedStudent}
              editingComment={editingComment}
              setEditingComment={setEditingComment}
            />

            {/* Signatures */}
            <Signatures />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPage;

const Header = ({ handlePrint, handleExport }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Student Result Sheet
        </h1>
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
