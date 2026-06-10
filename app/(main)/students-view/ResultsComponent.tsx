"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/shadcn/ui/card";
import { toast } from "sonner";

// components
import { PrintExportHeader } from "./printExportHeader";
import { StudentStats } from "./studentStats";
import { SchoolHeader } from "./schoolHeader";
import { ResultTable } from "./resultTable";
import { StudentSelection } from "./studentSelection";
import { ResultsSkeleton } from "./ResultsSkeleton";
import { Signatures } from "./signatures";
import { AcceptRejectButtons } from "./AcceptRejectButtons";
import { calculateStudentStats } from "./utils/scoreFns";
import createGradingFunctions from "./utils/gradingFns";
import { useAcceptRequest, useRejectRequest, useSaveRecord, useSaveStudentScores, getErrorMessage } from "@/fetcher/mutations";
import { getAssessmentStructure, getClassRecord, getGradingSystem, getRecord, getTeacherClasses } from "@/fetcher/queries";
import type { AcademicTerm, School, Student } from "@/types/drizzle";
import type { SaveClassRecordExportPayload } from "@/types/view";

type ResultsComponentProps = {
  school: School | null;
  academicTerm: AcademicTerm;
  requestId: string | null;
  mode: "view" | "review";
}

export default function ResultsComponent({ school, academicTerm, requestId, mode }: ResultsComponentProps) {

  const router = useRouter();

  // Get the grading system for the academic term (for calculating student stats)
  const { data: gradingEntry, error: gradingError, isLoading: isGradingLoading } = getGradingSystem(academicTerm.id);

  // getAssessmentStructure() to shape the result table
  const { data: assessmentStructure, error: assessmentError, isLoading: isAssessmentLoading } = getAssessmentStructure(academicTerm.id);

  // collect all errors and return the custom error component
  const assessmentOrGradingError = gradingError || assessmentError
  if (assessmentOrGradingError) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-destructive">Error: {assessmentOrGradingError.message}</p>
      </div>
    );
  }

  // Grading helper functions - recompute the grading functions iff the grading entry changes
  const { getGrade, getRemark, getOverallGrade, getOverallRemark } = useMemo(
    () => createGradingFunctions(gradingEntry || []),
    [gradingEntry]
  );

  // Memoise assessment structure sorting (by display order) 
  const sortedAssessmentStructure = useMemo(
    () =>
      [...(assessmentStructure ?? [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    [assessmentStructure],
  );

  // Mutation hook for saving student scores
  const { saveStudentScores } = useSaveStudentScores();
  const { saveRecord, isMutating: isExportingRecord } = useSaveRecord();
  const { acceptRequest } = useAcceptRequest();
  const { rejectRequest } = useRejectRequest();

  // Get class record based on the mode (view or review)
  let classRecord: any = null;
  let firstClassId: string | null = null;
  let modeLoading: boolean = false;
  let teacherClasses: any = [];
  if (mode === "view") {
    const { data: teacherClassesData = [], error: teacherClassesError, isLoading: isTeacherClassesLoading } = getTeacherClasses(academicTerm.id);
    teacherClasses = teacherClassesData;

    // For now, take only the first one (will be fixed later with a class selection ui)
    firstClassId = teacherClasses[0]?.id ?? null;

    // Use the chosen classId to get the class record
    const { data: classRecordData = null, error: classRecordError, isLoading: isClassRecordLoading } = getClassRecord(firstClassId, academicTerm.id);
    classRecord = classRecordData;
    modeLoading = isTeacherClassesLoading || isClassRecordLoading;
  }
  else if (mode === "review") {
    const { data: classRecordData = null, error: classRecordError, isLoading: isClassRecordLoading } = getRecord(requestId);
    classRecord = classRecordData;
    modeLoading = isClassRecordLoading;
  }

  // Get the students enrolled in the class as an array. 
  const classStudents: Student[] = useMemo(() => {
    if (!classRecord || !classRecord.students) return [];
    const students = classRecord.students;
    return Array.isArray(students) ? (students as Student[]) : [];  // Just being safe with typecasting
  }, [classRecord]);

  // students state: selected student, current student index
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(classStudents[0] ?? null); // default selected student as the first student
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0); // current student index to track the current student

  // editing states: track whether the user is editing scores. Converts td elements to input fields when editing.
  const [isEditingScores, setIsEditingScores] = useState(false);

  // global edit state - to disable other component action buttons when editing in one component
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);

  // Keep selection/index stable across student refreshes.
  // If the selected student no longer exists, fall back to the first student.
  // TODO: Use a cookie to save the selected student index across sessions.
  useEffect(() => {
    if (classStudents.length === 0) {
      if (selectedStudent) setSelectedStudent(null);
      if (currentStudentIndex !== 0) setCurrentStudentIndex(0);
      return;
    }

    const selectedId = selectedStudent?.id;
    const nextIndex = selectedId
      ? classStudents.findIndex((s) => s.id === selectedId)
      : 0;

    if (nextIndex === -1) {
      setSelectedStudent(classStudents[0]);
      setCurrentStudentIndex(0);
      return;
    }

    if (nextIndex !== currentStudentIndex) setCurrentStudentIndex(nextIndex);
    if (selectedStudent !== classStudents[nextIndex]) setSelectedStudent(classStudents[nextIndex]);
  }, [classStudents, selectedStudent, currentStudentIndex]);

  // Student Selection Component functionality (studentSelection component)
  // Previous student - decrease the current student index by 1 and set the selected student to the new index
  const goToPreviousStudent = (): void => {
    if (classStudents.length === 0 || currentStudentIndex <= 0) return;
    const newIndex = currentStudentIndex - 1;
    setCurrentStudentIndex(newIndex);
    setSelectedStudent(classStudents[newIndex]);
  };

  // Next student - increase the current student index by 1 and set the selected student to the new index
  const goToNextStudent = (): void => {
    if (classStudents.length === 0 || currentStudentIndex >= classStudents.length - 1) return;
    const newIndex = currentStudentIndex + 1;
    setCurrentStudentIndex(newIndex);
    setSelectedStudent(classStudents[newIndex]);
  };

  // Performance Calculation functionality (studentStats component): Average, total, grade, remark.
  // Memoise the derived student stats to avoid re-calculating it unless the selected student changes
  const studentStats = useMemo(
    () =>
      selectedStudent
        ? calculateStudentStats(
          selectedStudent,
          classStudents,
          sortedAssessmentStructure,
          getOverallGrade,
          getOverallRemark,
        )
        : null,
    [selectedStudent, classStudents, sortedAssessmentStructure, getOverallGrade, getOverallRemark],
  );

  // Edit functions - Set editing state to true to render input fields (spans when not editing, input when editing). Set global editing state to true to disable other component action buttons when editing in one component.
  const startEditingScores = (): void => {
    if (!selectedStudent) return;
    setIsEditingScores(true);
    setIsGlobalEditing(true);
  };

  // Edit functions - Cancel editing scores. Set editing state to false to render spans again. Set global editing state to false to enable other component action buttons.
  const cancelEditingScores = (): void => {
    setIsEditingScores(false);
    setIsGlobalEditing(false);
  };

  // Edit functions - save editing scores (persist to DB) 
  const handleSaveScores = async (
    studentSubjects: Array<{
      subjectId: string;
      scores: Array<{ assessmentStructureId: string; score: number }>;
    }>
  ): Promise<void> => {
    // if there is no selected student or academic term, return
    if (!selectedStudent.id || !academicTerm.id) return;

    // if the academic term is not active, return
    if (academicTerm.status !== "ACTIVE") {
      toast.error("Cannot save scores for this term. Please contact your administrator.");
      return;
    }

    // Otherwise, call the saveStudentScores mutation to save the scores to the database
    try {
      // Call the saveStudentScores mutation to save the scores to the database
      await saveStudentScores({
        studentId: selectedStudent.id,
        academicTermId: academicTerm.id,  // assuming this is the active academic term
        studentSubjects,
      });

      // Show success toast
      toast.success("Scores saved successfully");

      // Reset editing state
      setIsGlobalEditing(false);
      setIsEditingScores(false);
    } catch (err) {
      toast.error("Failed to save scores", {
        description: getErrorMessage(err, "An error occurred while saving scores"),
      });
    }
  };

  const handleExport = useCallback(async (): Promise<void> => {
    if (!firstClassId || !academicTerm.id) {
      toast.error("Class record is not ready to export yet.");
      return;
    }
    if (isGlobalEditing) {
      toast.warning("Finish or cancel editing before exporting.");
      return;
    }
    const payload: SaveClassRecordExportPayload = {
      comment: "Class record export",
      classId: firstClassId,
      academicTermId: academicTerm.id,
    };
    try {
      await saveRecord(payload);
      toast.success("Class record submitted for export.");
    } catch (err) {
      toast.error("Could not submit export", {
        description: getErrorMessage(err, "The export API is not available yet or the request failed."),
      });
    }
  }, [academicTerm.id, firstClassId, isGlobalEditing, saveRecord]);

  // Handle accept button click (org admin)
  const handleAccept = async (): Promise<void> => {
    // if the record request is missing, return
    if (!requestId) {
      toast.error("Record request is missing.");
      return;
    }

    // Otherwise, call the acceptRequest mutation to accept the record request
    try {
      await acceptRequest(requestId);
      toast.success("Record request accepted.");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Could not accept record request", {
        description: getErrorMessage(err, "The accept API is not available yet or the request failed."),
      });
    }
  }

  // Handle reject button click (org admin)
  const handleReject = async (rejectionReason: string): Promise<void> => {
    // if the record request is missing, return
    if (!requestId) {
      toast.error("Record request is missing.");
      return;
    }

    // Otherwise, call the rejectRequest mutation to reject the record request
    try {
      await rejectRequest({ requestId, rejectionReason });
      toast.success("Record request rejected.");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Could not reject record request", {
        description: getErrorMessage(err, "The reject API is not available yet or the request failed."),
      });
    }
  }

  // Handle loading state
  if (isGradingLoading || isAssessmentLoading || modeLoading) {
    return <ResultsSkeleton />;
  }

  // Handle no class assigned state. TODO: Style this to be more visually appealing.
  if (mode === "view" && !firstClassId) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground text-center max-w-md">
          You are not assigned as form teacher to any class for this term. Please contact your
          administrator.
        </p>
      </div>
    );
  }

  // Handle no student selected state (students array is empty). TODO: Style this to be more visually appealing.
  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">No students available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">

        {mode === "view" && (
          <PrintExportHeader
            handleExport={handleExport}
            isGlobalEditing={isGlobalEditing}
            isExporting={isExportingRecord}
            className={teacherClasses.length > 0 ? teacherClasses[0].name : null}
          />)}

        {mode === "review" && (
          <AcceptRejectButtons
            isGlobalEditing={isGlobalEditing}
            className={classRecord?.className ?? null}
            onAccept={handleAccept}
            onReject={handleReject}
          />)}

        {/* Student Selection - name and <- -> buttons to navigate through the students */}
        <StudentSelection
          goToPreviousStudent={goToPreviousStudent}
          goToNextStudent={goToNextStudent}
          currentStudentIndex={currentStudentIndex}
          setCurrentStudentIndex={setCurrentStudentIndex}
          students={classStudents}
          setSelectedStudent={setSelectedStudent}
          selectedStudent={selectedStudent}
          isGlobalEditing={isGlobalEditing}
        />

        {/* Result Sheet */}
        <Card>
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
                className={classRecord?.className ?? teacherClasses[0]?.name}
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
              assessmentStructure={sortedAssessmentStructure}
              isGlobalEditing={isGlobalEditing}
              readOnly={mode === "review"}
            />


            {/* Signatures */}
            <Signatures />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}