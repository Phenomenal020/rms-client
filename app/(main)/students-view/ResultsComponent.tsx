"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { toast } from "sonner";
import { PrintExportHeader } from "./printExportHeader";
import { StudentStats } from "./studentStats";
import { SchoolHeader } from "./schoolHeader";
import { ResultTable } from "./resultTable";
import { StudentSelection } from "./studentSelection";
import { ResultsContentSkeleton, StudentSelectionSkeleton } from "./ResultsSkeleton";
import { AcceptRejectButtons } from "./AcceptRejectButtons";
import { calculateStudentStats } from "./utils/scoreFns";
import createGradingFunctions from "./utils/gradingFns";
import { useAcceptRequest, useRejectRequest, useSaveRecord, useSaveStudentScores, getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { getAssessmentStructure, getClassRecord, getGradingSystem, getRecord, getTeacherClasses } from "@/fetcher/queries";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { useUser } from "@/contexts/user-context";
import type { AcademicTerm, AssessmentStructure, School, Student } from "@/types/drizzle";
import type { SaveClassRecordExportPayload } from "@/types/view";
import { ErrorBanner } from "@/shared-components/error-banner";
import {
  readResultsClassSelection,
  readResultsStudentSelection,
  writeResultsStudentSelection,
} from "./utils/selection-cookie";

type TeacherClassRow = { id: string; name: string };

type ResultsComponentProps = {
  school: School | null;
  academicTerm: AcademicTerm;
  requestId: string | null;
  mode: "view" | "review";
}
// Mode is view by default
export default function ResultsComponent({ school, academicTerm, requestId, mode }: ResultsComponentProps) {

  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();
  const isViewMode = mode === "view";
  const isReviewMode = mode === "review";
  const { user } = useUser();
  const canEdit =
    user?.role === "user" &&
    !(user?.twoFactorEnabled === true) &&
    user?.emailVerified === true;
  const canManage =
    user?.role === "orgadmin" &&
    !(user?.twoFactorEnabled === true) &&
    user?.emailVerified === true;
  const isReadOnly = !canEdit || isReviewMode;

  // Data hooks (always called; use `enabled` / null keys to suspend per mode)
  // Get assessment structure and grading system for the academic term
  const { data: gradingEntry, error: gradingError, isLoading: isGradingLoading } = getGradingSystem(academicTerm.id);
  const { data: assessmentStructure, error: assessmentError, isLoading: isAssessmentLoading } = getAssessmentStructure(academicTerm.id);

  // Get the classes assigned to the teacher for the academic term if in "view" mode
  const {
    data: teacherClasses,
    error: teacherClassesError,
    isLoading: isTeacherClassesLoading,
  } = getTeacherClasses(academicTerm.id, isViewMode);

  const ownedClasses = (teacherClasses ?? []) as TeacherClassRow[];

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Restore the last class for this term, otherwise the first class the teacher owns.
  useEffect(() => {
    if (!isViewMode) return;
    if (isTeacherClassesLoading) return;
    if (ownedClasses.length === 0) {
      setSelectedClassId(null);
      return;
    }
    setSelectedClassId((prev) => {
      if (prev && ownedClasses.some((cls) => cls.id === prev)) return prev;
      const savedClassId = readResultsClassSelection(academicTerm.id);
      if (savedClassId && ownedClasses.some((cls) => cls.id === savedClassId)) {
        return savedClassId;
      }
      return ownedClasses[0].id;
    });
  }, [isViewMode, isTeacherClassesLoading, ownedClasses, academicTerm.id]);

  // Get the class record for the selected class + term in "view" mode
  const {
    data: viewClassRecord,
    error: viewClassRecordError,
    isLoading: isClassRecordLoading,
  } = getClassRecord(selectedClassId, academicTerm.id, isViewMode);
  // Get the (class) record for the request id if in "review" mode
  const {
    data: reviewClassRecord,
    error: reviewClassRecordError,
    isLoading: isReviewRecordLoading,
  } = getRecord(requestId, isReviewMode);

  // collect data, errors, and loading states based on mode
  const classRecord = isViewMode ? viewClassRecord : reviewClassRecord;  // class record to use based on mode
  const classRecordError = isViewMode ? viewClassRecordError : reviewClassRecordError;  // class record error to use based on mode
  const waitingForClassPick =
    isViewMode && !isTeacherClassesLoading && (teacherClasses?.length ?? 0) > 0 && !selectedClassId;
  const modeLoading = isViewMode
    ? (isTeacherClassesLoading || waitingForClassPick || (!!selectedClassId && isClassRecordLoading))
    : isReviewRecordLoading;
  const reportLoadError =
    (gradingError ?? assessmentError ?? (isViewMode ? (teacherClassesError ?? classRecordError) : classRecordError)) ??
    null;

  // Mutation hooks
  const { saveStudentScores } = useSaveStudentScores();
  const { saveRecord, isMutating: isExportingRecord } = useSaveRecord();
  const { acceptRequest } = useAcceptRequest();
  const { rejectRequest } = useRejectRequest();

  // Grading helper functions - recompute when grading entry changes
  const { getGrade, getRemark, getOverallGrade, getOverallRemark } = useMemo(
    () => createGradingFunctions((gradingEntry ?? []) as Parameters<typeof createGradingFunctions>[0]),
    [gradingEntry],
  );
  const sortedAssessmentStructure = useMemo(
    () =>
      ([...(assessmentStructure ?? [])] as AssessmentStructure[]).sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    [assessmentStructure],
  );

  const classStudents: Student[] = useMemo(() => {
    if (!classRecord || !classRecord.students) return [];
    const students = classRecord.students;
    return Array.isArray(students) ? (students as Student[]) : [];
  }, [classRecord]);

  // students state: selected student, current student index
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(classStudents[0] ?? null); // default selected student as the first student
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0); // current student index to track the current student

  // editing states: track whether the user is editing scores. Converts td elements to input fields when editing.
  const [isEditingScores, setIsEditingScores] = useState(false);

  // global edit state - to disable other component action buttons when editing in one component
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const selectionLocked = isGlobalEditing || !canEdit;

  // Keep selection/index stable across student refreshes and class switches.
  // Restore the cookie student for this class+term, else fall back to the first student.
  useEffect(() => {
    if (classStudents.length === 0) {
      if (selectedStudent) setSelectedStudent(null);
      if (currentStudentIndex !== 0) setCurrentStudentIndex(0);
      return;
    }

    let nextIndex = selectedStudent
      ? classStudents.findIndex((s) => s.id === selectedStudent.id)
      : -1;

    if (nextIndex === -1 && selectedClassId) {
      const savedStudentId = readResultsStudentSelection(selectedClassId, academicTerm.id);
      nextIndex = savedStudentId
        ? classStudents.findIndex((s) => s.id === savedStudentId)
        : -1;
    }

    if (nextIndex === -1) nextIndex = 0;

    if (nextIndex !== currentStudentIndex) setCurrentStudentIndex(nextIndex);
    if (selectedStudent !== classStudents[nextIndex]) setSelectedStudent(classStudents[nextIndex]);
  }, [classStudents, selectedStudent, currentStudentIndex, selectedClassId, academicTerm.id]);

  useEffect(() => {
    if (!isViewMode || !selectedClassId || !academicTerm.id || !selectedStudent?.id) return;
    writeResultsStudentSelection({
      classId: selectedClassId,
      termId: academicTerm.id,
      studentId: selectedStudent.id,
    });
  }, [isViewMode, selectedClassId, academicTerm.id, selectedStudent?.id]);

  // Refresh the class record for the selected class + term
  const refreshClassRecord = useCallback(() => {
    if (!selectedClassId) return;
    void mutate(
      `/api/v1/student-view/class-record?classId=${encodeURIComponent(selectedClassId)}&termId=${encodeURIComponent(academicTerm.id)}`,
    );
  }, [selectedClassId, academicTerm.id, mutate]);

  // Retry report fetches - retry the report fetches if the report load error is present
  const retryReportFetches = useCallback(() => {
    const termId = academicTerm.id;
    void mutate(`/api/v1/grading-system?termId=${encodeURIComponent(termId)}`);
    void mutate(`/api/v1/assessment-structure?termId=${encodeURIComponent(termId)}`);
    if (isViewMode) {
      void mutate(`/api/v1/student-view/classes?termId=${encodeURIComponent(termId)}`);
      refreshClassRecord();
    } else if (requestId) {
      void mutate(`/api/v1/record/record?requestId=${encodeURIComponent(requestId)}`);
    }
  }, [academicTerm.id, isViewMode, requestId, mutate, refreshClassRecord]);

  // Handle auth redirect - handle the auth redirect if the report load error is present
  useEffect(() => {
    if (!reportLoadError) return;
    const status = getHttpStatus(reportLoadError);
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [reportLoadError, router, pathname]);

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
    if (!canEdit || !selectedStudent) return;
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
    if (!canEdit) return;
    if (!selectedStudent?.id || !academicTerm.id) return;
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
        academicTermId: academicTerm.id,
        studentSubjects,
      });
      refreshClassRecord();
      // Show success toast
      toast.success("Scores saved successfully");
      // Reset editing state
      setIsGlobalEditing(false);
      setIsEditingScores(false);
    } catch (err) {
      if (!handleAuthRedirect(err, { router, pathname })) {
        toast.error("Failed to save scores", {
          description: getApiErrorMessage(err, "An error occurred while saving scores"),
        });
      }
    }
  };

  const handleClassChange = (classId: string): void => {
    if (classId === selectedClassId) return;
    setIsEditingScores(false);
    setIsGlobalEditing(false);
    setSelectedStudent(null);
    setCurrentStudentIndex(0);
    setSelectedClassId(classId);
  };

  const handleExport = useCallback(async (): Promise<void> => {
    if (!canEdit) return;
    if (!selectedClassId || !academicTerm.id) {
      toast.error("Class record is not ready to export yet.");
      return;
    }
    if (isGlobalEditing) {
      toast.warning("Finish or cancel editing before exporting.");
      return;
    }
    const payload: SaveClassRecordExportPayload = {
      comment: "Class record export",
      classId: selectedClassId,
      academicTermId: academicTerm.id,
    };
    try {
      await saveRecord(payload);
      toast.success("Class record submitted for export.");
    } catch (err) {
      if (!handleAuthRedirect(err, { router, pathname })) {
        toast.error("Could not submit export", {
          description: getApiErrorMessage(err, "The export request failed. Please try again."),
        });
      }
    }
  }, [canEdit, academicTerm.id, selectedClassId, isGlobalEditing, saveRecord, router, pathname]);

  // Handle accept button click (org admin)
  const handleAccept = async (): Promise<void> => {
    if (!canManage) return;
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
      if (!handleAuthRedirect(err, { router, pathname })) {
        toast.error("Could not accept record request", {
          description: getApiErrorMessage(err, "The accept request failed. Please try again."),
        });
      }
    }
  }
  // Handle reject button click (org admin)
  const handleReject = async (rejectionReason: string): Promise<void> => {
    if (!canManage) return;
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
      if (!handleAuthRedirect(err, { router, pathname })) {
        toast.error("Could not reject record request", {
          description: getApiErrorMessage(err, "The reject request failed. Please try again."),
        });
      }
    }
  }

  // Handle auxiliary loading states: grading, assessment, mode loading
  const isReportDataLoading = isGradingLoading || isAssessmentLoading || modeLoading;
  const selectedClassName =
    classRecord?.className ??
    teacherClasses?.find((cls: TeacherClassRow) => cls.id === selectedClassId)?.name ??
    null;
  const teacherClassOptions = ownedClasses.map((cls) => ({
    id: cls.id,
    name: cls.name,
  }));

  if (reportLoadError !== null) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="Could not load class results"
            message={getApiErrorMessage(
              reportLoadError,
              "Failed to load grading, assessments, or class record. Please try again.",
            )}
            onRetry={retryReportFetches}
          />
        </div>
      </div>
    );
  }

  // Staged loading for only the report data loading
  if (isReportDataLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {mode === "view" && (
            <PrintExportHeader
              handleExport={handleExport}
              isGlobalEditing
              isExporting={isExportingRecord}
              className={selectedClassName}
              canEdit={canEdit}
              teacherClasses={teacherClassOptions}
              selectedClassId={selectedClassId}
              onSelectedClassChange={handleClassChange}
            />
          )}
          {mode === "review" && (
            <AcceptRejectButtons
              isGlobalEditing
              className={selectedClassName}
              onAccept={handleAccept}
              onReject={handleReject}
              canManage={canManage}
            />
          )}
          <StudentSelectionSkeleton />
          <Card>
            <CardContent className="p-3 md:p-8">
              <SchoolHeader school={school} academicTerm={academicTerm} />
              <ResultsContentSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // TODO: Style the "not assigned as form teacher" empty state (bare ErrorBanner + no-op retry).
  if (isViewMode && !isTeacherClassesLoading && (teacherClasses?.length ?? 0) === 0) {
    return <ErrorBanner title="Error" message="You are not assigned as form teacher to any class for this term. Please contact your administrator." onRetry={() => { }} />;
  }

  // TODO: Style the "no students in this class" empty state (bare ErrorBanner + no-op retry).
  if (classStudents.length === 0) {
    return <ErrorBanner title="Error" message="No students available for this class at this time. Please contact your administrator to enroll students" onRetry={() => { }} />;
  }

  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {mode === "view" && (
            <PrintExportHeader
              handleExport={handleExport}
              isGlobalEditing={isGlobalEditing}
              isExporting={isExportingRecord}
              className={selectedClassName}
              canEdit={canEdit}
              teacherClasses={teacherClassOptions}
              selectedClassId={selectedClassId}
              onSelectedClassChange={handleClassChange}
            />
          )}
          <StudentSelectionSkeleton />
        </div>
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
            className={selectedClassName}
            canEdit={canEdit}
            teacherClasses={teacherClassOptions}
            selectedClassId={selectedClassId}
            onSelectedClassChange={handleClassChange}
          />)}

        {mode === "review" && (
          <AcceptRejectButtons
            isGlobalEditing={isGlobalEditing}
            className={classRecord?.className ?? null}
            onAccept={handleAccept}
            onReject={handleReject}
            canManage={canManage}
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
                className={selectedClassName ?? undefined}
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
              readOnly={isReadOnly}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}