"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { StudentStats } from "./studentStats";
import { SchoolHeader } from "./schoolHeader";
import { StudentResultTable } from "./student-result-table";
import { StudentSelection } from "./studentSelection";
import { ResultsContentSkeleton, StudentSelectionSkeleton } from "./ResultsSkeleton";
import { calculateStudentStats } from "./helpers";
import createGradingFunctions from "./utils/gradingFns";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { getAssessmentStructure, getClassRecord, getGradingSystem, getTeacherClasses, type ClassRecordStudentRow, type TeacherClassRow } from "@/fetcher/queries";
import type { AcademicTerm, AssessmentStructure, School } from "@/types/drizzle";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { readResultsClassSelection, readResultsStudentSelection, writeResultsClassSelection, writeResultsStudentSelection } from "./utils/selection-cookie";
import { assessmentStructureKey, classRecordKey, gradingSystemKey, teacherClassesKey } from "@/fetcher/keys";

export default function StudentsComponent({ school, activeTermId, activeTerm }: { school: School; activeTermId: string; activeTerm: AcademicTerm }) {
  // for manual retries and redirection
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  // Get the grading system, assessment structure, and classes the user is a form teacher for
  const { data: gradingEntry, error: gradingError, isLoading: isGradingLoading } = getGradingSystem(activeTermId);
  const { data: assessmentStructure, error: assessmentError, isLoading: isAssessmentLoading } = getAssessmentStructure(activeTermId);
  const { data: teacherClasses, error: teacherClassesError, isLoading: isTeacherClassesLoading } = getTeacherClasses(activeTermId, true);

  // State management: Selected class id and classes this user is a form teacher for
  const ownedClasses = (teacherClasses ?? []) as TeacherClassRow[];
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Effect to correctly set the selected class id based on the saved class selection
  useEffect(() => {
    // If the classes are still loading, don't set the selected class id
    if (isTeacherClassesLoading) return;
    // If there are no classes, set the selected class id to null
    if (ownedClasses.length === 0) {
      setSelectedClassId(null);
      return;
    }
    // If there are classes,
    setSelectedClassId((prev) => {
      // If the previous class id is valid, return it
      if (prev && ownedClasses.some((cls) => cls.id === prev)) return prev;
      // If the saved class id from the cache is valid, return it
      const savedClassId = readResultsClassSelection(activeTermId);
      if (savedClassId && ownedClasses.some((cls) => cls.id === savedClassId)) {
        return savedClassId;
      }
      // If no valid class id is found, return the first class id
      return ownedClasses[0].id;
    });
  }, [isTeacherClassesLoading, ownedClasses, activeTermId]);

  // Get the class record for the selected class
  const { data: classRecord, error: classRecordError, isLoading: isClassRecordLoading } = getClassRecord(selectedClassId, activeTermId, true);

  // Combine the errors for all queries
  const reportLoadError = (gradingError ?? assessmentError ?? teacherClassesError ?? classRecordError) ?? null;

  // Create the grading functions
  const { getGrade, getRemark, getOverallGrade, getOverallRemark } = useMemo(
    () => createGradingFunctions(gradingEntry ?? []),
    [gradingEntry],
  );

  // Sort the assessment structure by display order
  const sortedAssessmentStructure = useMemo(
    () =>
      [...(assessmentStructure ?? [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ) as AssessmentStructure[],
    [assessmentStructure],
  );

  // Extract the students for the selected class
  const classStudents: ClassRecordStudentRow[] = useMemo(
    () => classRecord?.students ?? [],
    [classRecord],
  );

  // State management: Selected student and current student index
  const [selectedStudent, setSelectedStudent] = useState<ClassRecordStudentRow | null>(
    classStudents[0] ?? null,
  );
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

  // Effect to correctly set the selected student based on the saved student selection
  useEffect(() => {
    // If there are no students, set the selected student and current student index to null and 0
    if (classStudents.length === 0) {
      if (selectedStudent) setSelectedStudent(null);
      if (currentStudentIndex !== 0) setCurrentStudentIndex(0);
      return;
    }

    // Find the index of the selected student in the class students
    let nextIndex = selectedStudent
      ? classStudents.findIndex((s) => s.id === selectedStudent.id)
      : -1;

    // If the selected student is not found, check if there is a saved student selection
    if (nextIndex === -1 && selectedClassId) {
      // Get the saved student id from the cache
      const savedStudentId = readResultsStudentSelection(selectedClassId, activeTermId);
      // If the saved student id is valid, find the index of the saved student in the class students
      nextIndex = savedStudentId
        ? classStudents.findIndex((s) => s.id === savedStudentId)
        : -1;
    }

    // If the selected student is not found, set the next index to 0
    if (nextIndex === -1) nextIndex = 0;

    // If the next index is different from the current student index, set the current student index
    if (nextIndex !== currentStudentIndex) setCurrentStudentIndex(nextIndex);
    // If the next student id is different from the selected student id, set the selected student
    if (classStudents[nextIndex].id !== selectedStudent?.id) {
      setSelectedStudent(classStudents[nextIndex]);
    }
  }, [classStudents, selectedStudent, currentStudentIndex, selectedClassId, activeTermId]);

  // Effect to save the selected student selection to the cache
  useEffect(() => {
    // If there is no selected class id, active term id, or selected student id, return
    if (!selectedClassId || !activeTermId || !selectedStudent?.id) return;
    // Save the selected student selection to the cache
    writeResultsStudentSelection({
      classId: selectedClassId,
      termId: activeTermId,
      studentId: selectedStudent.id,
    });
  }, [selectedClassId, activeTermId, selectedStudent?.id]);

  // Effect to save the selected class selection to the cache
  useEffect(() => {
    if (!selectedClassId || !activeTermId) return;
    writeResultsClassSelection(selectedClassId, activeTermId);
  }, [selectedClassId, activeTermId]);

  // Function to refresh the class record
  const refreshClassRecord = useCallback(() => {
    if (!selectedClassId) return;
    void mutate(classRecordKey(selectedClassId, activeTermId));
  }, [selectedClassId, activeTermId, mutate]);

  // Function to retry the report fetches
  const retryReportFetches = useCallback(() => {
    void mutate(gradingSystemKey(activeTermId));
    void mutate(assessmentStructureKey(activeTermId));
    void mutate(teacherClassesKey(activeTermId));
    refreshClassRecord();
  }, [activeTermId, mutate, refreshClassRecord]);

  // Effect to redirect if there is a report load error with status 401 or 403
  useEffect(() => {
    if (!reportLoadError) return;
    const status = getHttpStatus(reportLoadError);
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [reportLoadError, router, pathname]);

  // Function to go to the previous student
  const goToPreviousStudent = (): void => {
    if (classStudents.length === 0 || currentStudentIndex <= 0) return;
    const newIndex = currentStudentIndex - 1;
    setCurrentStudentIndex(newIndex);
    setSelectedStudent(classStudents[newIndex]);
  };

  // Function to go to the next student
  const goToNextStudent = (): void => {
    if (classStudents.length === 0 || currentStudentIndex >= classStudents.length - 1) return;
    const newIndex = currentStudentIndex + 1;
    setCurrentStudentIndex(newIndex);
    setSelectedStudent(classStudents[newIndex]);
  };

  // Calculate the student stats
  const studentStats = useMemo(
    () =>
      selectedStudent
        ? calculateStudentStats(
          selectedStudent,
          sortedAssessmentStructure,
          getOverallGrade,
          getOverallRemark,
        )
        : null,
    [selectedStudent, sortedAssessmentStructure, getOverallGrade, getOverallRemark],
  );

  // Function to handle the class change
  const handleClassChange = (classId: string): void => {
    if (classId === selectedClassId) return;
    setSelectedStudent(null);
    setCurrentStudentIndex(0);
    setSelectedClassId(classId);
  };

  // Check if the user is waiting for a class pick
  const waitingForClassPick =
    !isTeacherClassesLoading && ownedClasses.length > 0 && !selectedClassId;
  const isReportDataLoading =
    isGradingLoading ||
    isAssessmentLoading ||
    isTeacherClassesLoading ||
    waitingForClassPick ||
    (!!selectedClassId && isClassRecordLoading);

  const selectedClassName =
    classRecord?.className ??
    ownedClasses.find((cls) => cls.id === selectedClassId)?.name ??
    null;

  const teacherClassOptions = ownedClasses.map((cls) => ({
    id: cls.id,
    name: cls.name,
  }));

  // Show the error banner if there is a report load error
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

  // Show the skeleton if the report data is loading
  if (isReportDataLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <StudentSelectionSkeleton />
          <Card>
            <CardContent className="p-3 md:p-8">
              <SchoolHeader school={school} academicTerm={activeTerm} />
              <ResultsContentSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show the error banner if the user is not assigned as form teacher to any class
  if (!isTeacherClassesLoading && ownedClasses.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="Not assigned as form teacher"
            message="You are not assigned as form teacher to any class for this term. Please contact your administrator."
          />
        </div>
      </div>
    );
  }

  // Show the empty no entry if there are no students in the selected class
  if (classStudents.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <EmptyNoEntry
            embedded
            title="No students in this class"
            description="No students are enrolled in this class yet."
            actionLabel="Manage enrollment"
            actionHref="/enrollment"
          />
        </div>
      </div>
    );
  }

  // Show the skeleton if the selected student is not found
  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <StudentSelectionSkeleton />
        </div>
      </div>
    );
  }

  // Generate the student name
  const studentName = [
    selectedStudent.firstName,
    selectedStudent.middleName,
    selectedStudent.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  // Show the student results table
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">

        <StudentSelection
          goToPreviousStudent={goToPreviousStudent}
          goToNextStudent={goToNextStudent}
          currentStudentIndex={currentStudentIndex}
          setCurrentStudentIndex={setCurrentStudentIndex}
          students={classStudents}
          setSelectedStudent={setSelectedStudent}
          selectedStudent={selectedStudent}
          teacherClasses={teacherClassOptions}
          selectedClassId={selectedClassId}
          onSelectedClassChange={handleClassChange}
        />

        <Card>
          <CardContent className="p-3 md:p-8">
            <SchoolHeader school={school} academicTerm={activeTerm} />

            {studentStats && (
              <StudentStats
                studentStats={studentStats}
                studentName={studentName}
                className={selectedClassName ?? undefined}
              />
            )}

            <StudentResultTable
              subjectRows={selectedStudent.subjects}
              assessmentStructure={sortedAssessmentStructure}
              getGrade={getGrade}
              getRemark={getRemark}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
