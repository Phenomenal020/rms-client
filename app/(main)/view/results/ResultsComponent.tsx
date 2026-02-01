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
// import { saveStudentScores } from "@/app/api/views/edit-student-action";
import { useUser } from "@/contexts/user-context";
import type { Student, AssessmentScore } from "@/types/drizzle";
import { School } from "@/types/school";
import { Subject } from "@/types/subjects";
// import {Loading} from './loading'

const ResultsPage = () => {


  // ------------------------------------------------------------------------------------------
  // Get user information
  const { user, error, isLoading, academicTerm, assessmentStructure, students: userStudents, subjects, gradingEntry, school } = useUser();

  // if(isLoading) {
  //   return <Loading />;
  // }

  // if(error) {
  //   return <div>Error: {error.message}</div>;
  // }

  // TODO: Add generic page to ensure that 1) subjects.length > 0  2) students.length > 0  3) gradingEntry.length > 0  4) school is not null


  // -------------------------------------------------------------------------------------------------
  // Print and Export Header Component functionality (printExportHeader component)
  // Todo: Handle Print functionality (Todo: Send academic term data to a server to generate the result sheet)
  const handlePrint = (): void => {
    window.print();
  };

  // Todo: Handle Export functionality (Send user info to their email address)
  const handleExport = (): void => {
    toast.info("Export functionality not available yet!");
  };
  // -------------------------------------------------------------------------------------------------



  // -------------------------------------------------------------------------------------------------
  // Helpers and State Management functionality (helpers and state management)
  // Grading helper functions - recompute the grading functions iff the grading entry changes
  const { getGrade, getRemark, getOverallGrade, getOverallRemark } = useMemo(() => createGradingFunctions(gradingEntry), [gradingEntry]);

  // students state: students list, selected student, current student index
  const [students, setStudents] = useState<Student[]>(userStudents || []); // students data from db
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(students[0] || null); // default selected studemt as the first student
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0); // current student index to track the current student

  // editing states: school, student, scores
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isEditingScores, setIsEditingScores] = useState(false);

  // editing subjects state: subjects to edit
  const [editingSubjects, setEditingSubjects] = useState<Subject[]>([]);
  const [editingStudentData, setEditingStudentData] = useState<Student | null>(null);

  // school state
  const [schoolData, setSchoolData] = useState<School | null>(school || null);
  const [editingSchoolData, setEditingSchoolData] = useState<School | null>(null);  // default is no edit (null)

  // global edit state - to disable other component action buttons when editing in one component`
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);

  // Sync students state when userStudents changes (e.g., when data loads)
  useEffect(() => {
    if (userStudents && school && academicTerm && assessmentStructure && gradingEntry && subjects) {
      setStudents(userStudents);
      // Debug: log when students are loaded
      if (userStudents.length === 0) {
        console.warn("No students found in userStudents");
      }
    }
  }, [userStudents, school, academicTerm, assessmentStructure, gradingEntry, subjects]);

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
  const goToPreviousStudent = (): void => {
    if (currentStudentIndex > 0 && students.length > 0) {
      const newIndex = currentStudentIndex - 1;
      setCurrentStudentIndex(newIndex);
      setSelectedStudent(students[newIndex]);
    }
  };


  // Next student - increase the current student index by 1 and set the selected student to the new index
  const goToNextStudent = (): void => {
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
  const startEditingSchool = (): void => {
    if (schoolData) {
      setEditingSchoolData({ ...schoolData });
    }
    setIsEditingSchool(true);
    setIsGlobalEditing(true);
  };

  // Edit functions - cancel editing school data (clear the editing school data state and update isEditingSchool to false to render spans again)
  const cancelEditingSchool = (): void => {
    setEditingSchoolData(null);
    setIsEditingSchool(false);
    setIsGlobalEditing(false);
  };

  // Edit functions - save editing school data (replace the school data with the editing school data and update isEditingSchool to false to render spans again)
  const saveSchoolChanges = (updatedSchool: School | null): void => {
    if (updatedSchool) {
      setSchoolData(updatedSchool);
      setEditingSchoolData(null);
    }
    setIsEditingSchool(false);
  };

  // -------------------------------------------------------------------------------------------------





  // -------------------------------------------------------------------------------------------------
  // Edit/Save Student Information Functions (editingStudents component)

  // Edit functions - start editing student data (copy the selected student's data into the editing student data state) and update isEditingStudent to true to render input fields (spans when not editing, input when editing)
  const startEditingStudent = (): void => {
    setIsEditingStudent(true);
    if (selectedStudent) {
      setEditingStudentData({ ...selectedStudent });
    }
    setIsGlobalEditing(true);
  };

  // Edit functions - cancel editing student data
  const cancelEditingStudent = (): void => {
    setIsEditingStudent(false);
    setEditingStudentData(null);
    setIsGlobalEditing(false);
  };

  // Edit functions - replace the selected student's data with the editing student data and update isEditingStudent to false to render spans again
  const saveStudentChanges = (updatedStudent: Student): void => {
    if (!selectedStudent) return;
    const targetId = updatedStudent.id || selectedStudent.id;
    setStudents((prev) =>
      prev.map((student) =>
        student.id === targetId ? { ...student, ...updatedStudent } : student
      )
    );
    setSelectedStudent((prev: Student | null) =>
      prev?.id === targetId ? { ...prev, ...updatedStudent } : prev
    );
    setIsEditingStudent(false);
    setIsGlobalEditing(false);
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
          assessmentStructure || [],
          getOverallGrade,
          getOverallRemark
        )
        : null,
    [selectedStudent, students, assessmentStructure, getOverallGrade, getOverallRemark]
  );

  // -------------------------------------------------------------------------------------------------






  // --------------------------------Edit/Save Scores Functions-----------------------------

  // Edit functions - start editing scores (copy the selected student's subjects into the editing subjects state) and update isEditingScores to true to render input fields (spans when not editing, input when editing)
  const startEditingScores = (): void => {
    if (!selectedStudent) return;
    setEditingSubjects(
      selectedStudent.subjects ? [...selectedStudent.subjects] : []
    );
    setIsEditingScores(true);
    setIsGlobalEditing(true);
  };

  // Edit functions - cancel editing scores
  const cancelEditingScores = (): void => {
    setEditingSubjects([]);
    setIsEditingScores(false);
    setIsGlobalEditing(false);
  };

  // Edit functions - save editing scores (persist to DB) 
  const handleSaveScores = async (studentSubjects: Array<{ subjectId: string; scores: Array<{ assessmentStructureId: string; score: number }> }>): Promise<void> => {
    // if there is no selected student or academic term, return
    if (!selectedStudent?.id || !academicTerm?.id) return;

    // // call the saveStudentScores server action to save the scores to the database
    // const result = await saveStudentScores(selectedStudent.id, academicTerm.id, studentSubjects);

    console.log("studentSubjects", studentSubjects);

    // // if there is an error, show a toast error
    // if ('error' in result && result.error) {
    //   toast.error(result.error);
    // } else if ('student' in result && result.student) {
    //   toast.success("Scores saved successfully");

    //   // Update local state with the fresh data from the database (keeps the ui in sync with the db)
    //   // The result.student comes from Prisma, which has a similar structure to our Student type
    //   // We need to cast it since Prisma types don't exactly match our Drizzle types
    //   const updatedStudent = result.student as unknown as Student;
    //   setStudents((prev) =>
    //     prev.map((stu) =>
    //       stu.id === selectedStudent.id ? updatedStudent : stu
    //     )  // update students state with the fresh data from the database (leaves other students unchanged)
    //   );
    //   setSelectedStudent((prev: Student | null) =>
    //     prev?.id === selectedStudent.id ? updatedStudent : prev  // if the selected student is the same as the updated student, update the selected student with the fresh data from the database
    //   );  // update selected student with the fresh data from the database
    //   setIsGlobalEditing(false);
    //   setIsEditingScores(false);
    // }
  };

  // -------------------------------------------------------------------------------------------------






  // -------------------------------------------------------------------------------------------------

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
      <div className="max-w-5xl mx-auto">

        {/* Header - contains print and export buttons */}
        <PrintExportHeader
          handlePrint={handlePrint}
          handleExport={handleExport}
          isGlobalEditing={isGlobalEditing}
        />

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
              academicTerm={academicTerm}
              isGlobalEditing={isGlobalEditing}
            />

            {/* Student Information, class and Total Days Present */}
            <EditingStudents
              isEditingStudent={isEditingStudent}
              startEditingStudent={startEditingStudent}
              saveStudentChanges={saveStudentChanges}
              cancelEditingStudent={cancelEditingStudent}
              selectedStudent={selectedStudent} // for student name and daysPresent.
              academicTerm={academicTerm} // for the class name  and total days present
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
              assessmentStructure={assessmentStructure || []}
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