"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { SubjectSelection, type SubjectOption } from "./subjectSelection";
import { SchoolHeader } from "../students-view/schoolHeader";
import { SubjectInfo } from "./subjectInfo";
import { SubjectResultTable } from "./subjectResultTable";
import { ResultsContentSkeleton, StudentSelectionSkeleton } from "../students-view/ResultsSkeleton";
import { calculateSubjectStats, getCanEdit, getCanLockUnlock, getEnrolledStudents } from "./helpers";
import createGradingFunctions from "../students-view/utils/gradingFns";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { getAssessmentStructure, getGradingSystem, getSubjectRecord, getTeacherSubjectAssignments, type TeacherSubjectAssignmentRow, type SubjectRecordStudentRow } from "@/fetcher/queries";
import { useUser } from "@/contexts/user-context";
import type { AcademicTerm, AssessmentStructure, School } from "@/types/drizzle";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { readResultsClassSelection, readResultsSubjectSelection, writeResultsClassSelection, writeResultsSubjectSelection } from "../students-view/utils/selection-cookie";
import { gradingSystemKey, assessmentStructureKey, subjectRecordKey, teacherSubjectAssignmentsKey } from "@/fetcher/keys";

type TeacherClassRow = { id: string; name: string };
// Get the unique classes from the subject assignments. Why? a teacher can be responsible for many subjects in a single class.
function getUniqueClasses(assignments: TeacherSubjectAssignmentRow[]): TeacherClassRow[] {
  const byId = new Map<string, TeacherClassRow>();
  for (const assignment of assignments) {
    if (!byId.has(assignment.classId)) {
      byId.set(assignment.classId, { id: assignment.classId, name: assignment.className });
    }
  }
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function SubjectsComponent({ school, activeTermId, activeTerm }: { school: School; activeTermId: string; activeTerm: AcademicTerm }) {
  // for redirection and manual retries
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  // Get the grading system and assessment structure for the term (for the helpers)
  const { data: gradingEntry, error: gradingError, isLoading: isGradingLoading } = getGradingSystem(activeTermId);
  const { data: assessmentStructure, error: assessmentError, isLoading: isAssessmentLoading } = getAssessmentStructure(activeTermId);
  // Get the subject assignments for the term (for the subject selection)
  const {
    data: teacherAssignments,
    error: teacherAssignmentsError,
    isLoading: isTeacherAssignmentsLoading,
  } = getTeacherSubjectAssignments(activeTermId, true);

  const assignmentRows = teacherAssignments ?? [];
  const uniqueClasses = useMemo(() => getUniqueClasses(assignmentRows), [assignmentRows]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Class selection logic
  useEffect(() => {
    if (isTeacherAssignmentsLoading) return;  // if the subject class assignments are still loading, do nothing
    if (uniqueClasses.length === 0) {
      setSelectedClassId(null);
      return;
    } // if there are no unique classes, set the selected class to null
    setSelectedClassId((prev) => {
      if (prev && uniqueClasses.some((cls) => cls.id === prev)) return prev;
      const savedClassId = readResultsClassSelection(activeTermId);
      if (savedClassId && uniqueClasses.some((cls) => cls.id === savedClassId)) {
        return savedClassId;
      }  // otherwise, read from cookie
      return uniqueClasses[0].id;  // finally, set to the first unique class
    });
  }, [isTeacherAssignmentsLoading, uniqueClasses, activeTermId]);

  // Subject selection logic -  loop through assignments and create a list of subject objects where the class id matches the selected class id.
  // The subject object contains subject id and name.
  const subjectsPerClass: SubjectOption[] = useMemo(
    () =>
      assignmentRows
        .filter((a) => a.classId === selectedClassId)
        .map((a) => ({
          subjectId: a.subjectId,
          subjectName: a.subjectName,
        })),
    [assignmentRows, selectedClassId],
  );

  // Subject selection state and logic
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  useEffect(() => {
    // If there are no subjects for the selected class, reset the selected subject and index.
    if (subjectsPerClass.length === 0) {
      if (selectedSubjectId !== null) setSelectedSubjectId(null);
      if (currentSubjectIndex !== 0) setCurrentSubjectIndex(0);
      return;
    }

    // Find the index of the selected subject in the subjectsPerClass array. If not found, set to -1 (not valid)
    let nextIndex = selectedSubjectId
      ? subjectsPerClass.findIndex((s) => s.subjectId === selectedSubjectId)
      : -1;

    // If the selected subject is not found (first load, class change, etc), try to find it in the saved subject selection (cookie)
    if (nextIndex === -1 && selectedClassId) {
      const savedSubjectId = readResultsSubjectSelection(selectedClassId, activeTermId);
      nextIndex = savedSubjectId
        ? subjectsPerClass.findIndex((s) => s.subjectId === savedSubjectId)
        : -1;
    }

    // If the selected subject is still not found, default to the first subject.
    if (nextIndex === -1) nextIndex = 0;

    // apply the result: set to current index and update selected subject id.
    if (nextIndex !== currentSubjectIndex) setCurrentSubjectIndex(nextIndex);
    if (subjectsPerClass[nextIndex].subjectId !== selectedSubjectId) {
      setSelectedSubjectId(subjectsPerClass[nextIndex].subjectId);
    }
  }, [subjectsPerClass, selectedSubjectId, currentSubjectIndex, selectedClassId, activeTermId]);

  // Get the assignment id for the selected subject and class.
  // Loop through the assignment rows and find the assignment id where the class id and subject id match the selected class and subject.
  const selectedAssignmentId = useMemo(() => {
    if (!selectedClassId || !selectedSubjectId) return null;
    return (
      assignmentRows.find(
        (a) => a.classId === selectedClassId && a.subjectId === selectedSubjectId,
      )?.assignmentId ?? null
    );
  }, [assignmentRows, selectedClassId, selectedSubjectId]);

  // Use that assignment id and the active term id to load the subject record.
  const {
    data: subjectRecord,
    error: subjectRecordError,
    isLoading: isSubjectRecordLoading,
  } = getSubjectRecord(selectedAssignmentId, activeTermId, true);

    // Get the user and check if they can make changes. Also track if any component is being edited.
  const { user } = useUser();
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  // Check if the user can edit the subject record (assigned teacher of the selected assignment)
  const canEdit = useMemo(
    () => getCanEdit(user, selectedAssignmentId, assignmentRows),
    [user, selectedAssignmentId, assignmentRows],
  );
  // Check if the user can lock/unlock the subject record (form teacher of the selected class)
  const canLockUnlock = useMemo(
    () => getCanLockUnlock(user, selectedClassId, assignmentRows),
    [user, selectedClassId, assignmentRows],
  );
  // Reset the global editing state when the selected assignment id changes.
  useEffect(() => {
    setIsGlobalEditing(false);
  }, [selectedAssignmentId]);

  // Combine all the errors into a single error object.
  const reportLoadError = (gradingError ?? assessmentError ?? teacherAssignmentsError ?? subjectRecordError) ?? null;

  // Get the students for the selected subject and class. This is going to contain all the students for the selected subject and class whether they are enrolled in the subject for that class and term or not
  const classStudents: SubjectRecordStudentRow[] = useMemo(() => {
    return subjectRecord?.students ?? [];
  }, [subjectRecord]);

  // Helper to sort the assessment structure by display order.
  const sortedAssessmentStructure = useMemo(
    () =>
      [...(assessmentStructure ?? [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ) as AssessmentStructure[],
    [assessmentStructure],
  );

  // Helper to get the grade and remark for a student.
  const { getGrade, getRemark } = useMemo(() => createGradingFunctions(gradingEntry || []), [gradingEntry]);

  // Get the name of the selected subject.
  const selectedSubjectName = useMemo(
    () => subjectsPerClass.find((s) => s.subjectId === selectedSubjectId)?.subjectName ?? null,
    [subjectsPerClass, selectedSubjectId],
  );

  // Helper to manually refresh the subject record.
  const refreshSubjectRecord = useCallback(() => {
    if (!selectedAssignmentId) return;
    void mutate(subjectRecordKey(selectedAssignmentId, activeTermId));
  }, [selectedAssignmentId, activeTermId, mutate]);

  // Helper to manually refeesh the entire component (try again feature on error)
  const retryReportFetches = useCallback(() => {
    const termId = activeTermId;
    void mutate(gradingSystemKey(termId));
    void mutate(assessmentStructureKey(termId));
    void mutate(teacherSubjectAssignmentsKey(termId));
    refreshSubjectRecord();
  }, [activeTermId, mutate, refreshSubjectRecord]);

  // Handle unauthorised and forbidden errors.
  useEffect(() => {
    if (!reportLoadError) return;
    const status = getHttpStatus(reportLoadError);
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [reportLoadError, router, pathname]);

  // Get the enrolled students for the selected subject and class (where enrolled flag is true)
  const enrolledStudents = useMemo(
    () => getEnrolledStudents(classStudents),
    [classStudents],
  );

  // Calculate the subject stats (average, median, etc) for the enrolled students.
  const subjectStats = useMemo(
    () =>
      enrolledStudents.length > 0
        ? calculateSubjectStats(enrolledStudents, sortedAssessmentStructure)
        : null,
    [enrolledStudents, sortedAssessmentStructure],
  );

  // Helper to handle class change.
  const handleClassChange = (classId: string): void => {
    if (classId === selectedClassId) return;
    setSelectedSubjectId(null);
    setCurrentSubjectIndex(0);
    setSelectedClassId(classId);
  };

  // Save the selected class id to the cookie.
  useEffect(() => {
    if (!selectedClassId || !activeTermId) return;
    writeResultsClassSelection(selectedClassId, activeTermId);
  }, [selectedClassId, activeTermId]);

  // Save the selected subject id to the cookie.
  useEffect(() => {
    if (!selectedClassId || !activeTermId || !selectedSubjectId) return;
    writeResultsSubjectSelection(selectedClassId, activeTermId, selectedSubjectId);
  }, [selectedClassId, activeTermId, selectedSubjectId]);

  // Loading state for the result table. It depends on the following:
  // - sub-components that block the result table --> Grading system, Assessment structure, and teacher assignments
  // - Waiting for class pick
  // - Waiting for subject pick (due to unresolved assignment id though)
  // - Finally, the big one - the record data itself loading
  const waitingForClassPick =
    !isTeacherAssignmentsLoading && uniqueClasses.length > 0 && !selectedClassId;
  const waitingForSubjectPick =
    !!selectedClassId && subjectsPerClass.length > 0 && !selectedAssignmentId;
  const isReportDataLoading =
    isGradingLoading ||
    isTeacherAssignmentsLoading ||
    waitingForClassPick ||
    waitingForSubjectPick ||
    (!!selectedAssignmentId && isSubjectRecordLoading) ||
    isAssessmentLoading;

  // Render the error banner if there is an error.
  if (reportLoadError !== null) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="Could not load subject results"
            message={getApiErrorMessage(
              reportLoadError,
              "Failed to load grading, assessments, or subject record. Please try again.",
            )}
            onRetry={retryReportFetches}
          />
        </div>
      </div>
    );
  }

  // Render the loading state if the report data is still loading.
  if (isReportDataLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <SubjectSelection
            isGlobalEditing
            setCurrentSubjectIndex={setCurrentSubjectIndex}
            subjects={[]}
            // Render the subjec selection with independent states selectors not affected by the report data table loading.
            setSelectedSubjectId={setSelectedSubjectId}
            selectedSubjectId={selectedSubjectId}
            teacherClasses={uniqueClasses}
            selectedClassId={selectedClassId}
            onSelectedClassChange={handleClassChange}
          />
          <StudentSelectionSkeleton />
          <Card>
            <CardContent className="p-3 md:p-8">
              <SchoolHeader school={school} academicTerm={activeTerm} />
              {/* Show the skeleton in place of the table */}
              <ResultsContentSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the no assignments error if the teacher is not assigned to any subjects for this term and not a form teacher for any class.
  if (!isTeacherAssignmentsLoading && assignmentRows.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="No subject assignments"
            message="You are not assigned to teach any subjects for this term, and you are not a form teacher for any class. Please contact your administrator."
          />
        </div>
      </div>
    );
  }

  // Render the no subjects assigned error if the teacher is not assigned to any subjects for this class and term.
  if (subjectsPerClass.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <EmptyNoEntry
            embedded
            title="No subjects assigned"
            description="No subjects are assigned to this class for the current term."
            actionLabel="Manage classes"
            actionHref="/classes"
          />
        </div>
      </div>
    );
  }

  // Render the main component.
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Subject selection */}
        <SubjectSelection
          isGlobalEditing={isGlobalEditing}
          setCurrentSubjectIndex={setCurrentSubjectIndex}
          subjects={subjectsPerClass}
          setSelectedSubjectId={setSelectedSubjectId}
          selectedSubjectId={selectedSubjectId}
          teacherClasses={uniqueClasses}
          selectedClassId={selectedClassId}
          onSelectedClassChange={handleClassChange}
        />

        <Card>
          <CardContent className="p-3 md:p-8">
            {/* School header */}
            <SchoolHeader school={school} academicTerm={activeTerm} />

            {/* Subject info */}
            <SubjectInfo
              selectedSubject={selectedSubjectName}
              enrolledStudentsCount={enrolledStudents.length}
              academicTerm={activeTerm}
              subjectStats={subjectStats}
            />

            {/* Subject result table */}
            <SubjectResultTable
              key={selectedAssignmentId ?? "no-assignment"}
              assignmentId={selectedAssignmentId!}
              termId={activeTermId}
              isEffectivelyLocked={subjectRecord?.isEffectivelyLocked ?? true}
              enrolledStudents={enrolledStudents}
              getGrade={getGrade}
              getRemark={getRemark}
              assessmentStructure={sortedAssessmentStructure}
              canEdit={canEdit}
              canLockUnlock={canLockUnlock}
              isGlobalEditing={isGlobalEditing}
              onGlobalEditingChange={setIsGlobalEditing}
              onRecordRefresh={refreshSubjectRecord}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}