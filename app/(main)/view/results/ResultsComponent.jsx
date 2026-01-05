"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

// components
import { Signatures } from "./signatures";
import { StudentStats } from "./studentStats";
import { EditingStudents } from "./editingStudents";
import { SchoolHeader } from "./schoolHeader";
import { ResultTable } from "./resultTable";
import { StudentSelection } from "./studentSelection";
import createGradingFunctions from "./utils/gradingFns";
import { getSubjectScores, calculateStudentStats } from "./utils/scoreFns";
import { updateStudentScores } from "@/app/api/views/edit-student-action";

const ResultsPage = ({ user }) => {
  // Grading helper functions
  const gradingFunctions = useMemo(() => createGradingFunctions(user.academicTerms[0]?.gradingSystem), [user.academicTerms[0]?.gradingSystem]);

  // Extract grading functions - grade, remark, overall grade, overall remark
  const { getGrade, getRemark, getOverallGrade, getOverallRemark } = gradingFunctions;

  // students state
  const [students, setStudents] = useState(user.academicTerms[0].students); // students data from db
  const [selectedStudent, setSelectedStudent] = useState(students[0] || null); // default selected studemt as the first student
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0); // current student index to track the current student

  // editing states: school, student, scores(default = 0), subjects
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editingSubjects, setEditingSubjects] = useState([]);

  // school state
  const [schoolData, setSchoolData] = useState(user.school);
  const [editingSchoolData, setEditingSchoolData] = useState(null);  // default is no edit

  // ensure default selected student is the first student
  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]); // default selected student as the first student
      setCurrentStudentIndex(0); // default current student index as 0
    }
  }, [students, selectedStudent]);


  // -------------------------------------------------------------------

  // Helper function wrapper to get scores for each subject - passes assessment structure from academicTerm
  const getSubjectScoresWrapper = (subject) => {
    return getSubjectScores(subject, user.academicTerms[0]?.assessmentStructure || []);
  };

  // Memoise the derived student stats to avoid re-calculating it unless the selected student changes
  const studentStats = useMemo(
    () =>
      selectedStudent
        ? calculateStudentStats(
            selectedStudent,
            students,
            user.academicTerms[0]?.assessmentStructure || [],
            getOverallGrade,
            getOverallRemark
          )
        : null,
    [selectedStudent, students, user.academicTerms[0]?.assessmentStructure, getOverallGrade, getOverallRemark]
  );

  // --------------------------------Prev/Next Student Functions-----------------------------

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

  // --------------------------------Edit/Save Student Functions (Student name)-----------------------------

  // Edit functions - start editing student data (copy the selected student's data into the editing student data state) and update isEditingStudent to true to render input fields (spans when not editing, input when editing)
  const startEditingStudent = () => {
    setIsEditingStudent(true);
  };

  // Edit functions - cancel editing student data
  const cancelEditingStudent = () => {
    setIsEditingStudent(false);
  };

  // Edit functions - replace the selected student's data with the editing student data and update isEditingStudent to false to render spans again
  const saveStudentChanges = (updatedStudent) => {
    if (updatedStudent && (updatedStudent.id || selectedStudent?.id)) {
      const targetId = updatedStudent.id || selectedStudent.id;
      setStudents((prev) =>
        prev.map((student) =>
          student.id === targetId ? { ...student, ...updatedStudent } : student
        )
      );
      setSelectedStudent((prev) =>
        prev?.id === targetId ? { ...prev, ...updatedStudent } : prev
      );
    }
    setIsEditingStudent(false);
  };

  // --------------------------------Edit/Save Scores Functions-----------------------------

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

  // Edit functions - save editing scores (persist to DB)
  const handleSaveScores = () => {
    if (!selectedStudent?.id) {
      toast.error("Missing student");
      return;
    }

    const payload = {
      studentId: selectedStudent.id,
      subjects: editingSubjects.map((subj) => ({
        subjectId: subj.subjectId || subj.subject?.id,
        scores: (subj.scores || []).map((s) => ({
          type: s.type,
          score: Number(s.score ?? 0),
        })),
      })),
    };

    updateStudentScores(payload).then((result) => {
      if (result?.error) {
        toast.error("Failed to save scores", { description: result.error });
        return;
      }

      const updatedSubjects =
        result.assessments?.map((a) => ({
          subjectId: a.subjectId,
          subject: a.subject,
          assessmentId: a.id,
          scores:
            a.scores?.map((sc) => ({
              type: sc.assessmentStructure?.type || "",
              score: sc.score ?? 0,
            })) || [],
        })) || [];

      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, subjects: updatedSubjects }
            : student
        )
      );
      setSelectedStudent((prev) =>
        prev?.id === selectedStudent.id
          ? { ...prev, subjects: updatedSubjects }
          : prev
      );
      setIsEditingScores(false);
      toast.success("Scores updated");
    });
  };

  // Edit functions - handle score change ********************
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
  // --------------------------------Edit/Save School Information Functions-----------------------------

  // Edit functions - start editing school data (copy the school data into the editing school data state) and update isEditingSchool to true to render input fields (spans when not editing, input when editing)
  const startEditingSchool = () => {
    setEditingSchoolData({ ...schoolData });
    setIsEditingSchool(true);
  };

  // Edit functions - cancel editing school data (clear the editing school data state and update isEditingSchool to false to render spans again)
  const cancelEditingSchool = () => {
    setEditingSchoolData({});
    setIsEditingSchool(false);
  };

  // Edit functions - save editing school data (replace the school data with the editing school data and update isEditingSchool to false to render spans again)
  const saveSchoolChanges = (updatedSchool) => {
    if (updatedSchool && Object.keys(updatedSchool).length > 0) {
      setSchoolData({ ...updatedSchool });
    }
    setIsEditingSchool(false);
  };

  // Todo: Handle Print functionality (Todo: Send academic term data to a server to generate the result sheet)
  const handlePrint = () => {
    window.print();
  };

  // Todo: Handle Export functionality (Send user info to their email address)
  const handleExport = () => {
    toast.info("Export functionality not available yet!");
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
            {/* School Header Containing School info + save/edit functions */}
            <SchoolHeader
              isEditingSchool={isEditingSchool}
              startEditingSchool={startEditingSchool}
              saveSchoolChanges={saveSchoolChanges}
              cancelEditingSchool={cancelEditingSchool}
              editingSchoolData={editingSchoolData}
              setEditingSchoolData={setEditingSchoolData}
              school={schoolData}  // to render the students names in the select dropdown
              academicTerm={user.academicTerms[0]}
            />

            {/* Student Information, class and Total Days Present */}
            <EditingStudents
              isEditingStudent={isEditingStudent}
              startEditingStudent={startEditingStudent}
              saveStudentChanges={saveStudentChanges}
              cancelEditingStudent={cancelEditingStudent}
              selectedStudent={selectedStudent} // for student name and daysPresent. 
              academicTerm={user.academicTerms[0]} // for the class name  and total days present
            />

            {/* Academic Performance: Main section */}
            <ResultTable
              isEditingScores={isEditingScores}
              startEditingScores={startEditingScores}
              handleSaveScores={handleSaveScores}
              cancelEditingScores={cancelEditingScores}
              editingSubjects={editingSubjects}
              selectedStudent={selectedStudent}
              handleScoreChange={handleScoreChange}
              getSubjectScores={getSubjectScoresWrapper}
              getGrade={getGrade} // for the grade calculation
              getRemark={getRemark} // for the remark calculation
              assessmentStructure={user.academicTerms[0]?.assessmentStructure || []}
            />

            {/* Summary Statistics */}
            {studentStats && <StudentStats studentStats={studentStats} />}

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
        {/* Student Result Sheet Header Text */}
        <h1 className="text-2xl font-bold text-gray-900">
          Student Result Sheet
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