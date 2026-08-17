"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";

import { PrintExportHeader } from "./printExportHeader";
import { SubjectSelection, type SubjectOption } from "./subjectSelection";
import { SchoolHeader } from "../students-view/schoolHeader";
import { SubjectInfo } from "./subjectInfo";
import { SubjectResultTable } from "./subjectResultTable";
import { ResultsContentSkeleton, StudentSelectionSkeleton } from "../students-view/ResultsSkeleton";
import { calculateSubjectStats, getEnrolledStudents } from "./helpers";
import createGradingFunctions from "../students-view/utils/gradingFns";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { getAssessmentStructure, getClassRecord, getGradingSystem, getTeacherClasses } from "@/fetcher/queries";
import { useUser } from "@/contexts/user-context";
import type { AcademicTerm, AssessmentStructure, School, Student } from "@/types/drizzle";
import { ErrorBanner } from "@/shared-components/error-banner";
import {
  readResultsClassSelection,
  readResultsSubjectSelection,
  writeResultsClassSelection,
  writeResultsSubjectSelection,
} from "../students-view/utils/selection-cookie";

type TeacherClassRow = { id: string; name: string };

export default function SubjectsComponent({ school, academicTerm }: { school: School; academicTerm: AcademicTerm }) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  const { user } = useUser();
  const canEdit =
    user?.role === "user" &&
    !(user?.twoFactorEnabled === true) &&
    user?.emailVerified === true;

  const isGlobalEditing = false;

  // data hooks: grading system, teacher classes, class record, assessment structure
  const { data: gradingEntry, error: gradingError, isLoading: isGradingLoading } = getGradingSystem(academicTerm.id);
  const { data: assessmentStructure, error: assessmentError, isLoading: isAssessmentLoading } = getAssessmentStructure(academicTerm.id);
  const { data: teacherClasses, error: teacherClassesError, isLoading: isTeacherClassesLoading } = getTeacherClasses(academicTerm.id, true);

  const ownedClasses = (teacherClasses ?? []) as TeacherClassRow[];
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
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
  }, [isTeacherClassesLoading, ownedClasses, academicTerm.id]);

  const { data: classRecord, error: classRecordError, isLoading: isClassRecordLoading } = getClassRecord(
    selectedClassId,
    academicTerm.id,
    true,
  );

  const reportLoadError =
    (gradingError ?? assessmentError ?? teacherClassesError ?? classRecordError) ?? null;

  const classStudents: Student[] = useMemo(() => {
    if (!classRecord?.students) return [];
    return Array.isArray(classRecord.students) ? (classRecord.students as Student[]) : [];
  }, [classRecord]);

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

  // Keep selection/index stable across class/subject refreshes.
  // Restore the cookie subject for this class+term, else fall back to the first subject.
  useEffect(() => {
    if (subjectOptions.length === 0) {
      if (selectedSubjectId !== null) setSelectedSubjectId(null);
      if (currentSubjectIndex !== 0) setCurrentSubjectIndex(0);
      return;
    }

    let nextIndex = selectedSubjectId
      ? subjectOptions.findIndex((s) => s.subjectId === selectedSubjectId)
      : -1;

    if (nextIndex === -1 && selectedClassId) {
      const savedSubjectId = readResultsSubjectSelection(selectedClassId, academicTerm.id);
      nextIndex = savedSubjectId
        ? subjectOptions.findIndex((s) => s.subjectId === savedSubjectId)
        : -1;
    }

    if (nextIndex === -1) nextIndex = 0;

    if (nextIndex !== currentSubjectIndex) setCurrentSubjectIndex(nextIndex);
    if (subjectOptions[nextIndex].subjectId !== selectedSubjectId) {
      setSelectedSubjectId(subjectOptions[nextIndex].subjectId);
    }
  }, [subjectOptions, selectedSubjectId, currentSubjectIndex, selectedClassId, academicTerm.id]);

  const refreshClassRecord = useCallback(() => {
    if (!selectedClassId) return;
    void mutate(
      `/api/v1/student-view/class-record?classId=${encodeURIComponent(selectedClassId)}&termId=${encodeURIComponent(academicTerm.id)}`,
    );
  }, [selectedClassId, academicTerm.id, mutate]);

  const retryReportFetches = useCallback(() => {
    const termId = academicTerm.id;
    void mutate(`/api/v1/grading-system?termId=${encodeURIComponent(termId)}`);
    void mutate(`/api/v1/assessment-structure?termId=${encodeURIComponent(termId)}`);
    void mutate(`/api/v1/student-view/classes?termId=${encodeURIComponent(termId)}`);
    refreshClassRecord();
  }, [academicTerm.id, mutate, refreshClassRecord]);

  useEffect(() => {
    if (!reportLoadError) return;
    const status = getHttpStatus(reportLoadError);
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [reportLoadError, router, pathname]);

  const enrolledStudents = useMemo(
    () => (selectedSubjectId ? getEnrolledStudents(selectedSubjectId, classStudents) : []),
    [selectedSubjectId, classStudents],
  );

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

  const goToPreviousSubject = (): void => {
    if (subjectOptions.length === 0 || currentSubjectIndex <= 0) return;
    const newIndex = currentSubjectIndex - 1;
    setCurrentSubjectIndex(newIndex);
    setSelectedSubjectId(subjectOptions[newIndex].subjectId);
  };

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

  const handleClassChange = (classId: string): void => {
    if (classId === selectedClassId) return;
    setSelectedSubjectId(null);
    setCurrentSubjectIndex(0);
    setSelectedClassId(classId);
  };

  useEffect(() => {
    if (!selectedClassId || !academicTerm.id) return;
    writeResultsClassSelection(selectedClassId, academicTerm.id);
  }, [selectedClassId, academicTerm.id]);

  useEffect(() => {
    if (!selectedClassId || !academicTerm.id || !selectedSubjectId) return;
    writeResultsSubjectSelection(selectedClassId, academicTerm.id, selectedSubjectId);
  }, [selectedClassId, academicTerm.id, selectedSubjectId]);

  const waitingForClassPick =
    !isTeacherClassesLoading && ownedClasses.length > 0 && !selectedClassId;
  const isReportDataLoading =
    isGradingLoading ||
    isTeacherClassesLoading ||
    waitingForClassPick ||
    (!!selectedClassId && isClassRecordLoading) ||
    isAssessmentLoading;

  const selectedClassName =
    classRecord?.className ??
    ownedClasses.find((cls) => cls.id === selectedClassId)?.name ??
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

  if (isReportDataLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <PrintExportHeader
            isGlobalEditing
            className={selectedClassName}
            teacherClasses={teacherClassOptions}
            selectedClassId={selectedClassId}
            onSelectedClassChange={handleClassChange}
          />
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

  // TODO: Style the "not assigned as form teacher" empty state.
  if (!isTeacherClassesLoading && ownedClasses.length === 0) {
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

  // TODO: Style the "no subjects assigned" empty state.
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
          isGlobalEditing={isGlobalEditing}
          className={selectedClassName}
          teacherClasses={teacherClassOptions}
          selectedClassId={selectedClassId}
          onSelectedClassChange={handleClassChange}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
