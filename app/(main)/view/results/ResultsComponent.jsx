"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/shadcn/ui/card";
import { toast } from "sonner";

// components
import { PrintExportHeader } from "./printExportHeader";
import { Signatures } from "./signatures";
import { StudentStats } from "./studentStats";
import { EditingStudents } from "./editingStudents";
import { SchoolHeader } from "./schoolHeader";
import { ResultTable } from "./resultTable";
import { StudentSelection } from "./studentSelection";

import { calculateStudentStats } from "./utils/scoreFns";
import createGradingFunctions from "./utils/gradingFns";
import { saveStudentScores } from "@/app/api/views/edit-student-action";

const ResultsPage = ({ user }) => {


  // -------------------------------------------------------------------------------------------------
  // Print and Export Header Component functionality (printExportHeader component)

  // Todo: Handle Print functionality (Todo: Send academic term data to a server to generate the result sheet)
  const handlePrint = () => {
    window.print();
  };

  // Todo: Handle Export functionality (Send user info to their email address)
  const handleExport = () => {
    toast.info("Export functionality not available yet!");
  };
  // -------------------------------------------------------------------------------------------------


  // -------------------------------------------------------------------------------------------------
  // Helpers and State Management functionality (helpers and state management)

  // router to refresh the page
  const router = useRouter();

  // Grading helper functions - recompute the grading functions iff the grading system changes
  const { getGrade, getRemark, getOverallGrade, getOverallRemark } = useMemo(() => createGradingFunctions(user.academicTerms[0]?.gradingSystem), [user.academicTerms[0]?.gradingSystem]);

  // students state: students list, selected student, current student index
  const [students, setStudents] = useState(user.academicTerms[0].students); // students data from db
  const [selectedStudent, setSelectedStudent] = useState(students[0] || null); // default selected studemt as the first student
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0); // current student index to track the current student

  // editing states: school, student, scores
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isEditingScores, setIsEditingScores] = useState(false);

  // editing subjects state: subjects to edit
  const [editingSubjects, setEditingSubjects] = useState([]);
  const [editingStudentData, setEditingStudentData] = useState(null);

  // school state
  const [schoolData, setSchoolData] = useState(user.school);
  const [editingSchoolData, setEditingSchoolData] = useState(null);  // default is no edit

  // global edit state - to disable other component action buttons when editing in one component
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);

  // ensure default selected student is the first student: TODO: Use a cookie to save the selected student index across sessions
  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]); // default selected student as the first student
      setCurrentStudentIndex(0); // default current student index as 0
    }
  }, [students, selectedStudent]);

  // -------------------------------------------------------------------





  // -------------------------------------------------------------------------------------------------
  // Student Selection Component functionality (studentSelection component)

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

  // -------------------------------------------------------------------------------------------------





  // -------------------------------------------------------------------------------------------------
  // Edit/Save School Information Functions (schoolHeader component)

  // Edit functions - start editing school data (copy the school data into the editing school data state) and update isEditingSchool to true to render input fields (spans when not editing, input when editing)
  const startEditingSchool = () => {
    setEditingSchoolData({ ...schoolData });
    setIsEditingSchool(true);
    setIsGlobalEditing(true);
  };

  // Edit functions - cancel editing school data (clear the editing school data state and update isEditingSchool to false to render spans again)
  const cancelEditingSchool = () => {
    setEditingSchoolData({});
    setIsEditingSchool(false);
    setIsGlobalEditing(false);
  };

  // Edit functions - save editing school data (replace the school data with the editing school data and update isEditingSchool to false to render spans again)
  const saveSchoolChanges = (updatedSchool) => {
    if (updatedSchool) {
      setSchoolData({ ...updatedSchool });
      setEditingSchoolData(null);
    }
    setIsEditingSchool(false);
  };

  // -------------------------------------------------------------------------------------------------





  // -------------------------------------------------------------------------------------------------
  // Edit/Save Student Information Functions (editingStudents component)

  // Edit functions - start editing student data (copy the selected student's data into the editing student data state) and update isEditingStudent to true to render input fields (spans when not editing, input when editing)
  const startEditingStudent = () => {
    setIsEditingStudent(true);
    setEditingStudentData({ ...selectedStudent });
    setIsGlobalEditing(true);
  };

  // Edit functions - cancel editing student data
  const cancelEditingStudent = () => {
    setIsEditingStudent(false);
    setEditingStudentData(null);
    setIsGlobalEditing(false);
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

  // -------------------------------------------------------------------------------------------------






  // -------------------------------------------------------------------------------------------------
  // Performance Calculation functionality (studentStats component)

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

  // -------------------------------------------------------------------------------------------------






  // --------------------------------Edit/Save Scores Functions-----------------------------

  // Edit functions - start editing scores (copy the selected student's subjects into the editing subjects state) and update isEditingScores to true to render input fields (spans when not editing, input when editing)
  const startEditingScores = () => {
    setEditingSubjects(
      selectedStudent.subjects ? [...selectedStudent.subjects] : []
    );
    setIsEditingScores(true);
    setIsGlobalEditing(true);
  };

  // Edit functions - cancel editing scores
  const cancelEditingScores = () => {
    setEditingSubjects([]);
    setIsEditingScores(false);
    setIsGlobalEditing(false);
  };

  // Edit functions - save editing scores (persist to DB)
  const handleSaveScores = async (studentSubjects) => {
    const result = await saveStudentScores(selectedStudent.id, user.academicTerms[0].id, studentSubjects);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Scores saved successfully");
      // update local state so the UI reflects the new scores without a full reload
      const updatedSubjects = (selectedStudent.subjects || []).map((subj) => {
        const incoming = studentSubjects.find((s) => s.subjectId === subj.subjectId);
        if (!incoming) return subj;
        const existingAssessment = subj.assessments?.[0] || {};
        return {
          ...subj,
          assessments: [
            {
              ...existingAssessment,
              scores: incoming.scores,
            },
          ],
        };
      });
      setStudents((prev) =>
        prev.map((stu) =>
          stu.id === selectedStudent.id ? { ...stu, subjects: updatedSubjects } : stu
        )
      );
      setSelectedStudent((prev) =>
        prev?.id === selectedStudent.id ? { ...prev, subjects: updatedSubjects } : prev
      );
      setIsGlobalEditing(false);
      setIsEditingScores(false);
      router.refresh();
    }
  };

  // -------------------------------------------------------------------------------------------------






  // -------------------------------------------------------------------------------------------------

  // if no student is selected, show a 'No students available' message
  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">No students available</p>
      </div>
    );
  }
  // ---------------------------------------------------------------------------------------------






  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header - contains print and export buttons */}
        <PrintExportHeader handlePrint={handlePrint} handleExport={handleExport} isGlobalEditing={isGlobalEditing} />

        {/* Student Selection - name and <- -> buttons to navigate through the students */}
        <StudentSelection
          goToPreviousStudent={goToPreviousStudent}
          goToNextStudent={goToNextStudent}
          currentStudentIndex={currentStudentIndex}
          setCurrentStudentIndex={setCurrentStudentIndex}
          students={students}
          setSelectedStudent={setSelectedStudent}
          selectedStudent={selectedStudent}
          isGlobalEditing={isGlobalEditing}
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
              isGlobalEditing={isGlobalEditing}
            />

            {/* Student Information, class and Total Days Present */}
            <EditingStudents
              isEditingStudent={isEditingStudent}
              startEditingStudent={startEditingStudent}
              saveStudentChanges={saveStudentChanges}
              cancelEditingStudent={cancelEditingStudent}
              selectedStudent={selectedStudent} // for student name and daysPresent. 
              academicTerm={user.academicTerms[0]} // for the class name  and total days present
              isGlobalEditing={isGlobalEditing}
            />

            {/* Academic Performance: Main section */}
            <ResultTable
              isEditingScores={isEditingScores}
              startEditingScores={startEditingScores}
              handleSaveScores={handleSaveScores}
              cancelEditingScores={cancelEditingScores}
              selectedStudent={selectedStudent}
              getGrade={getGrade} // for the grade calculation
              getRemark={getRemark} // for the remark calculation
              assessmentStructure={user.academicTerms[0]?.assessmentStructure || []}
              isGlobalEditing={isGlobalEditing}
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

