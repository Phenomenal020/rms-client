"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

// components
import { Signatures } from "./signatures";
import { Comments } from "./comments";
import { StudentStats } from "./studentStats";
import { EditingStudents } from "./editingStudents";
import { SchoolHeader } from "./schoolHeader";
import { ResultTable } from "./resultTable";
import { StudentSelection } from "./studentSelection";
import createGradingFunctions from "./utils/gradingFns";
import transformData from "./utils/transformDataFn";
import { getSubjectScores, calculateStudentStats } from "./utils/scoreFns";

const ResultsPage = ({ user, academicTerm }) => {
  // Transform the data to format required by the component. This function does a lot of nested mapping. So, it is memoised to avoid re-calculating it unless the academic term changes.
  const transformedData = useMemo(() => transformData(user, academicTerm), [academicTerm]);
  // Likewise
  const gradingFunctions = useMemo(() => createGradingFunctions(academicTerm?.gradingSystem), [academicTerm?.gradingSystem]);

  // Extract grading functions - grade, remark, overall grade, overall remark
  const { getGrade, getRemark, getOverallGrade, getOverallRemark } = gradingFunctions;

  // students state
  const [students, setStudents] = useState(transformedData.students); // students data from db
  const [selectedStudent, setSelectedStudent] = useState(students[0] || null); // default selected studemt as the first student
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0); // current student index to track the current student

  // editing states: school, student, scores(default = 0), subjects
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editingStudentData, setEditingStudentData] = useState({})
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editingSubjects, setEditingSubjects] = useState([]);

  // TODO: Comments not in schema yet
  // const [editingComment, setEditingComment] = useState("");
  // const [isEditingComments, setIsEditingComments] = useState(false);

  // school state
  const [schoolData, setSchoolData] = useState(transformedData.schoolData);
  const [editingSchoolData, setEditingSchoolData] = useState(null);

  // Update selected student when students change
  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]); // default selected student as the first student
      setCurrentStudentIndex(0); // default current student index as 0
    }
  }, [students, selectedStudent]);

  // Update states when transformed data changes
  useEffect(() => {
    setStudents(transformedData.students);
    setSchoolData(transformedData.schoolData);
    if (transformedData.students.length > 0) {
      setSelectedStudent(transformedData.students[0]);
      setCurrentStudentIndex(0);
    }
  }, [transformedData]);

  // -------------------------------------------------------------------

  // Helper function wrapper to get scores for each subject - passes assessment structure from academicTerm
  const getSubjectScoresWrapper = (subject) => {
    return getSubjectScores(subject, academicTerm?.assessmentStructure || []);
  };

  // Memoise the derived student stats to avoid re-calculating it unless the selected student changes
  const studentStats = useMemo(
    () =>
      selectedStudent
        ? calculateStudentStats(
            selectedStudent,
            students,
            academicTerm?.assessmentStructure || [],
            getOverallGrade,
            getOverallRemark
          )
        : null,
    [selectedStudent, students, academicTerm?.assessmentStructure, getOverallGrade, getOverallRemark]
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
        student.name === selectedStudent.name ? editingStudentData : student
      )
    );
    setSelectedStudent(editingStudentData);
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

  // Edit functions - save editing scores
  const saveScoreChanges = () => {
    setStudents((prev) =>
      // get the previous student data and update the subjects  (containing the scores)with the editing subjects
      prev.map((student) =>
        student.name === selectedStudent.name
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

  // TODO: Comments not in schema yet - Commented out until comments field is added to Student model
  // Edit functions - start editing comments (copy the selected student's comments into the editing comment state) and update isEditingComments to true to render input fields (span when not editing, textarea when editing)
  // const startEditingComments = () => {
  //   setEditingComment(selectedStudent.comments || "");
  //   setIsEditingComments(true);
  // };

  // Edit functions - cancel editing comments
  // const cancelEditingComments = () => {
  //   setEditingComment("");
  //   setIsEditingComments(false);
  // };

  // Edit functions - save editing comments
  // const saveCommentsChanges = () => {
  //   setStudents((prev) =>
  //     prev.map((student) =>
  //       student._id === selectedStudent._id
  //         ? { ...student, comments: editingComment }
  //         : student
  //     )
  //   );
  //   setSelectedStudent({ ...selectedStudent, comments: editingComment });
  //   setIsEditingComments(false);
  // };

  // -------------------------------------------------------------------

  // Todo: Handle Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Todo: Handle Export functionality
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

            {/* Student Information, class and Total Days Present */}
            <EditingStudents
              isEditingStudent={isEditingStudent}
              startEditingStudent={startEditingStudent}
              saveStudentChanges={saveStudentChanges}
              cancelEditingStudent={cancelEditingStudent}
              editingStudentData={editingStudentData}
              setEditingStudentData={setEditingStudentData}
              selectedStudent={selectedStudent}
              classData={transformedData.classData}
            />

            {/* Academic Performance: Main section */}
            <ResultTable
              isEditingScores={isEditingScores}
              startEditingScores={startEditingScores}
              saveScoreChanges={saveScoreChanges}
              cancelEditingScores={cancelEditingScores}
              editingSubjects={editingSubjects}
              selectedStudent={selectedStudent}
              handleScoreChange={handleScoreChange}
              getSubjectScores={getSubjectScoresWrapper}
              getGrade={getGrade}
              getRemark={getRemark}
              assessmentStructure={academicTerm?.assessmentStructure || []}
            />

            {/* Summary Statistics */}
            {studentStats && <StudentStats studentStats={studentStats} />}

            {/* Comments Section */}
            {/* TODO: Comments not in schema yet - Commented out until comments field is added to Student model */}
            {/* <Comments
              isEditingComments={isEditingComments}
              startEditingComments={startEditingComments}
              saveCommentsChanges={saveCommentsChanges}
              cancelEditingComments={cancelEditingComments}
              selectedStudent={selectedStudent}
              editingComment={editingComment}
              setEditingComment={setEditingComment}
            /> */}

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