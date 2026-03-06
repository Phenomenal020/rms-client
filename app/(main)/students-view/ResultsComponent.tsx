"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/shadcn/ui/card";
import { toast } from "sonner";

// components
import { PrintExportHeader } from "./printExportHeader";
import { Signatures } from "./signatures";
import { StudentStats } from "./studentStats";
import { StudentInfo } from "./editingStudents";
import { SchoolHeader } from "./schoolHeader";
import { ResultTable } from "./resultTable";
import { StudentSelection } from "./studentSelection";
import { ResultsSkeleton } from "./ResultsSkeleton";
import { calculateStudentStats } from "./utils/scoreFns";
import createGradingFunctions from "./utils/gradingFns";
import { useSaveStudentScores, getErrorMessage } from "@/fetcher/mutations";
import { useUser } from "@/contexts/user-context";
import type { Student, AssessmentScore } from "@/types/drizzle";
import { Subject } from "@/types/subjects";

const ResultsPage = () => {

  // ------------------------------------------------------------------------------------------
  // Get user information
  const { user, error, isLoading, academicTerm, assessmentStructure, students: userStudents, subjects, gradingEntry, school } = useUser();

  // Router hook for refreshing the page
  const router = useRouter();

  // Mutation hook for saving student scores
  const { saveStudentScores, isMutating: isSavingScores } = useSaveStudentScores();

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  // TODO: Add generic page to ensure that 1) subjects.length > 0  2) students.length > 0  3) gradingEntry.length > 0  4) school is not null

  // -------------------------------------------------------------------------------------------------
  // Print and Export Header Component functionality (printExportHeader component)
  // Todo: Handle Print functionality (Todo: Send academic term data to a server to generate the result sheet)
  const handlePrint = (): void => {
    toast.info("Print functionality not available yet!");
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

  // editing states: scores
  const [isEditingScores, setIsEditingScores] = useState(false);

  // editing subjects state: subjects to edit
  const [editingSubjects, setEditingSubjects] = useState<Subject[]>([]);

  // global edit state - to disable other component action buttons when editing in one component`
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);

  // Sync students state when userStudents changes (e.g., when data loads)
  useEffect(() => {
    if (userStudents && school && academicTerm && assessmentStructure && gradingEntry && subjects) {
      setStudents(userStudents);
      // // Debug: log when students are loaded
      // if (userStudents.length === 0) {
      //   console.warn("No students found in userStudents");
      // }
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

    try {
      // Call the saveStudentScores mutation to save the scores to the database
      await saveStudentScores({
        studentId: selectedStudent.id,
        academicTermId: academicTerm.id,
        studentSubjects,
      });

      // Show success toast
      toast.success("Scores saved successfully");

      // Reset editing state
      setIsGlobalEditing(false);
      setIsEditingScores(false);
      router.refresh();
    } catch (err) {
      toast.error("Failed to save scores", {
        description: getErrorMessage(err, "An error occurred while saving scores"),
      });
    }
  };

  // -------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------
  // Show skeleton while loading
  if (isLoading) {
    return <ResultsSkeleton />;
  }

  // if no student is selected, show a 'No students available' message
  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">No students available</p>
      </div>
    );
  }
  // ---------------------------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
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
          <CardContent className="p-3 md:p-8">

            {/* School Header - displays school info and academic term */}
            <SchoolHeader
              school={school}
              academicTerm={academicTerm}
            />

            {/* Summary Statistics */}
            {studentStats && (
              <StudentStats
                studentStats={studentStats}
                studentName={[selectedStudent?.firstName, selectedStudent?.middleName, selectedStudent?.lastName].filter(Boolean).join(" ")}
                className={academicTerm?.class?.name}
              />
            )}

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


            {/* Signatures */}
            {/* <Signatures /> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPage;