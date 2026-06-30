"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { toast } from "sonner";

import { PrintExportHeader } from "./printExportHeader";
import { SubjectSelection, type SubjectOption } from "./subjectSelection";
import { SchoolHeader } from "../students-view/schoolHeader";
import { SubjectInfo } from "./subjectInfo";
import { SubjectResultTable } from "./subjectResultTable";
import {ResultsContentSkeleton, ResultsHeaderSkeleton, StudentSelectionSkeleton} from "../students-view/ResultsSkeleton";
import { Signatures } from "../students-view/signatures";
import { calculateSubjectStats, getEnrolledStudents } from "./helpers";
import createGradingFunctions from "../students-view/utils/gradingFns";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import {getAssessmentStructure, getClassRecord, getGradingSystem, getTeacherClasses} from "@/fetcher/queries";
import { useUser } from "@/contexts/user-context";
import type { AcademicTerm, AssessmentStructure, School, Student } from "@/types/drizzle";
import { ErrorBanner } from "@/shared-components/error-banner";

export default function SubjectsComponent({school, academicTerm}: {school: School; academicTerm: AcademicTerm}) {
  // Routing and manual mutation for retries
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  // Retrieve the user's role. Only regular users can edit scores.
  const { user } = useUser();
  const canEdit = user?.role === "user";

  // Global editing (across all sub-components) is disabled for now.
  const isGlobalEditing = false;
  const selectionLocked = isGlobalEditing || !canEdit;

  // data hooks: grading system, teacher classes, class record, assessment structure
  const { data: gradingEntry, error: gradingError, isLoading: isGradingLoading } = getGradingSystem(academicTerm.id);
  const { data: assessmentStructure, error: assessmentError, isLoading: isAssessmentLoading } = getAssessmentStructure(academicTerm.id);
  const { data: teacherClasses, error: teacherClassesError, isLoading: isTeacherClassesLoading } = getTeacherClasses(academicTerm.id, true);
  const firstClassId = teacherClasses?.[0]?.id ?? null;
  const {data: classRecord, error: classRecordError, isLoading: isClassRecordLoading} = getClassRecord(firstClassId, academicTerm.id, true);

  // Aggregate error states
  const reportLoadError = gradingError ?? assessmentError ?? teacherClassesError ?? classRecordError;

  // Extraact the students from the class record
  const classStudents: Student[] = useMemo(() => {
    if (!classRecord?.students) return [];
    return Array.isArray(classRecord.students) ? (classRecord.students as Student[]) : [];
  }, [classRecord]);

  // Extract the subject options from the class record
  const subjectOptions: SubjectOption[] = useMemo(
    () =>
      (classRecord?.assignments ?? [])
        .filter((a) => a.subjectId && a.subjectName)
        .map((a) => ({
          subjectId: a.subjectId,
          subjectName: a.subjectName,
        })),
    [classRecord],
  );

  // Sort the assessment structure by display order
  const sortedAssessmentStructure = useMemo(
    () =>
      [...(assessmentStructure ?? [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ) as AssessmentStructure[],
    [assessmentStructure],
  );

  // Create the grading functions
  const { getGrade, getRemark } = useMemo(
    () => createGradingFunctions(gradingEntry || []),
    [gradingEntry],
  );

  // State for the selected subject and current subject index
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);

  // Extract the selected subject name
  const selectedSubjectName = useMemo(
    () => subjectOptions.find((s) => s.subjectId === selectedSubjectId)?.subjectName ?? null,
    [subjectOptions, selectedSubjectId],
  );

  // Effect to update the selected subject and current subject index
  useEffect(() => {
    if (subjectOptions.length === 0) {
      if (selectedSubjectId !== null) setSelectedSubjectId(null);
      if (currentSubjectIndex !== 0) setCurrentSubjectIndex(0);
      return;
    }

    const id = selectedSubjectId;
    const nextIndex = id
      ? subjectOptions.findIndex((s) => s.subjectId === id)
      : 0;

    if (nextIndex === -1) {
      setSelectedSubjectId(subjectOptions[0].subjectId);
      setCurrentSubjectIndex(0);
      return;
    }

    if (nextIndex !== currentSubjectIndex) setCurrentSubjectIndex(nextIndex);
    if (subjectOptions[nextIndex].subjectId !== selectedSubjectId) {
      setSelectedSubjectId(subjectOptions[nextIndex].subjectId);
    }
  }, [subjectOptions, selectedSubjectId, currentSubjectIndex]);

  // Function to refresh the class record
  const refreshClassRecord = useCallback(() => {
    if (!firstClassId) return;
    void mutate(
      `/api/v1/student-view/class-record?classId=${encodeURIComponent(firstClassId)}&termId=${encodeURIComponent(academicTerm.id)}`,
    );
  }, [firstClassId, academicTerm.id, mutate]);

  // Function to retry the report fetches
  const retryReportFetches = useCallback(() => {
    const termId = academicTerm.id;
    void mutate(`/api/v1/grading-system?termId=${encodeURIComponent(termId)}`);
    void mutate(`/api/v1/assessment-structure?termId=${encodeURIComponent(termId)}`);
    void mutate(`/api/v1/student-view/classes?termId=${encodeURIComponent(termId)}`);
    refreshClassRecord();
  }, [academicTerm.id, mutate, refreshClassRecord]);

  // Effect to handle the report load error by redirecting to the sign-in or forbidden page
  useEffect(() => {
    if (!reportLoadError) return;
    const status = getHttpStatus(reportLoadError);
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [reportLoadError, router, pathname]);

  // Extract the enrolled students for the selected subject
  const enrolledStudents = useMemo(
    () => (selectedSubjectId ? getEnrolledStudents(selectedSubjectId, classStudents) : []),
    [selectedSubjectId, classStudents],
  );

  // Extract the subject stats for the selected subject
  const subjectStats = useMemo(
    () =>
      selectedSubjectId
        ? calculateSubjectStats(
          selectedSubjectId,
          enrolledStudents,
          sortedAssessmentStructure,
        )
        : null,
    [selectedSubjectId, enrolledStudents, sortedAssessmentStructure],
  );

  // Function to go to the previous subject
  const goToPreviousSubject = (): void => {
    if (subjectOptions.length === 0 || currentSubjectIndex <= 0) return;
    const newIndex = currentSubjectIndex - 1;
    setCurrentSubjectIndex(newIndex);
    setSelectedSubjectId(subjectOptions[newIndex].subjectId);
  };

  // Function to go to the next subject
  const goToNextSubject = (): void => {
    if (
      subjectOptions.length === 0 ||
      currentSubjectIndex >= subjectOptions.length - 1
    ) {
      return;
    }
    const newIndex = currentSubjectIndex + 1;
    setCurrentSubjectIndex(newIndex);
    setSelectedSubjectId(subjectOptions[newIndex].subjectId);
  };

  // Function to handle the export functionality
  const handleExport = (): void => {
    if (!canEdit) return;
    toast.info("Export functionality not available yet!");
  };

  // Aggregate loading states
  const isReportDataLoading = isGradingLoading || isTeacherClassesLoading || isClassRecordLoading || isAssessmentLoading;
  const headerClassName = teacherClasses?.[0]?.name ?? null;

  // Show error banner if there is a report load error
  if (reportLoadError) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="Could not load subject results"
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

  // Show loading skeleton if the report data is loading
  if (isReportDataLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ResultsHeaderSkeleton />
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

  // Show error banner if there is no class assigned
  if (teacherClasses !== undefined && !firstClassId) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="No class assigned"
            message="You are not assigned as form teacher to any class for this term. Please contact your administrator."
            onRetry={retryReportFetches}
          />
        </div>
      </div>
    );
  }

  // Show error banner if there are no subjects assigned
  if (subjectOptions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="No subjects assigned"
            message="No subjects are assigned to this class for the current term."
            onRetry={retryReportFetches}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <PrintExportHeader
          handleExport={handleExport}
          isGlobalEditing={isGlobalEditing}
          className={headerClassName}
          canEdit={canEdit}
        />

        <SubjectSelection
          goToPreviousSubject={goToPreviousSubject}
          goToNextSubject={goToNextSubject}
          currentSubjectIndex={currentSubjectIndex}
          setCurrentSubjectIndex={setCurrentSubjectIndex}
          subjects={subjectOptions}
          setSelectedSubjectId={setSelectedSubjectId}
          selectedSubjectId={selectedSubjectId}
          isGlobalEditing={isGlobalEditing}
        />

        <Card>
          <CardContent className="p-3 md:p-8">
            <SchoolHeader school={school} academicTerm={academicTerm} />

            <SubjectInfo
              selectedSubject={selectedSubjectName}
              enrolledStudentsCount={enrolledStudents.length}
              academicTerm={academicTerm}
              subjectStats={subjectStats}
            />

            <SubjectResultTable
              enrolledStudents={enrolledStudents}
              selectedSubjectId={selectedSubjectId}
              getGrade={getGrade}
              getRemark={getRemark}
              assessmentStructure={sortedAssessmentStructure}
              readOnly={!canEdit}
            />

            <Signatures />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}