"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { toast } from "sonner";

// components
import { PrintExportHeader } from "./printExportHeader";
import { SubjectSelection } from "./subjectSelection";
import { SchoolHeader } from "../students-view/schoolHeader";
import { SubjectInfo } from "./subjectInfo";
import { SubjectResultTable } from "./subjectResultTable";
import { ResultsSkeleton } from "../students-view/ResultsSkeleton";
import { Signatures } from "../students-view/signatures";
import { calculateSubjectStats, getEnrolledStudents } from "./helpers";
import createGradingFunctions from "../students-view/utils/gradingFns";
import { getAssessmentStructure, getClassRecord, getGradingSystem, getTeacherClasses } from "@/fetcher/queries";
import type { AcademicTerm, School, Student } from "@/types/drizzle";

export default function SubjectsComponent({ school, academicTerm }: { school: School, academicTerm: AcademicTerm }) {
  // Grading system for this term (grade / remark helpers)
  const { data: gradingEntry, error: gradingError, isLoading: isGradingLoading } =
    getGradingSystem(academicTerm.id);

  // Classes assigned to the form teacher
  const { data: teacherClasses = [], error: teacherClassesError, isLoading: isTeacherClassesLoading } = getTeacherClasses(academicTerm.id);

  // For now, only the first class (TODO: class selection UI)
  const firstClassId = teacherClasses[0]?.id ?? null;

  // Use the chosen classId to get the class record
  const { data: classRecord = null, error: classRecordError, isLoading: isClassRecordLoading } = getClassRecord(firstClassId, academicTerm.id);

  // Students on the class record
  const classStudents: Student[] = useMemo(() => {
    if (!classRecord || !classRecord.students) return [];
    const students = classRecord.students;
    return Array.isArray(students) ? (students as Student[]) : [];
  }, [classRecord]);

  // Subject names from class assignments (drives subject dropdown / table)
  const subjectNames = useMemo(
    () =>
      (classRecord?.assignments ?? [])
        .map((a) => a.subjectName)
        .filter(Boolean) as string[],
    [classRecord],
  );

  // `Get the assessment structure for the academic term`
  const { data: assessmentStructure, error: assessmentError, isLoading: isAssessmentLoading } =
    getAssessmentStructure(academicTerm.id)
  const sortedAssessmentStructure = useMemo(
    () =>
      [...(assessmentStructure ?? [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    [assessmentStructure],
  );

  // collect all errors and return the custom error component
  const error =
    gradingError || teacherClassesError || classRecordError || assessmentError;
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  // handle export functionality
  const handleExport = (): void => {
    toast.info("Export functionality not available yet!");
  };

  // Grading helpers — rebuilt when grading entry changes
  const { getGrade, getRemark } = useMemo(
    () => createGradingFunctions(gradingEntry || []),
    [gradingEntry],
  );

  // Selected subject + index (mirrors student selection in ResultsComponent)
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);

  // TODO: re-enable when subject-view score editing returns — wire to table + disable chrome while editing
  const isGlobalEditing = false;

  // Keep subject selection stable across refetches (same pattern as ResultsComponent / classStudents)
  useEffect(() => {
    if (subjectNames.length === 0) {
      if (selectedSubjectName !== null) setSelectedSubjectName(null);
      if (currentSubjectIndex !== 0) setCurrentSubjectIndex(0);
      return;
    }

    const name = selectedSubjectName;
    const nextIndex = name ? subjectNames.findIndex((n) => n === name) : 0;

    if (nextIndex === -1) {
      setSelectedSubjectName(subjectNames[0]);
      setCurrentSubjectIndex(0);
      return;
    }

    if (nextIndex !== currentSubjectIndex) setCurrentSubjectIndex(nextIndex);
    if (subjectNames[nextIndex] !== selectedSubjectName) {
      setSelectedSubjectName(subjectNames[nextIndex]);
    }
  }, [subjectNames, selectedSubjectName, currentSubjectIndex]);

  const enrolledStudents = useMemo(
    () =>
      selectedSubjectName
        ? getEnrolledStudents(selectedSubjectName, classStudents)
        : [],
    [selectedSubjectName, classStudents],
  );

  const subjectStats = useMemo(
    () =>
      selectedSubjectName
        ? calculateSubjectStats(
          selectedSubjectName,
          enrolledStudents,
          sortedAssessmentStructure,
        )
        : null,
    [selectedSubjectName, enrolledStudents, sortedAssessmentStructure],
  );

  // go to previous subject
  const goToPreviousSubject = (): void => {
    if (subjectNames.length === 0 || currentSubjectIndex <= 0) return;
    const newIndex = currentSubjectIndex - 1;
    setCurrentSubjectIndex(newIndex);
    setSelectedSubjectName(subjectNames[newIndex]);
  };

  // go to next subject
  const goToNextSubject = (): void => {
    if (
      subjectNames.length === 0 ||
      currentSubjectIndex >= subjectNames.length - 1
    ) {
      return;
    }
    const newIndex = currentSubjectIndex + 1;
    setCurrentSubjectIndex(newIndex);
    setSelectedSubjectName(subjectNames[newIndex]);
  };

  // if any of the loading states are true, return the results skeleton
  if (isGradingLoading || isTeacherClassesLoading || isClassRecordLoading || isAssessmentLoading) {
    return <ResultsSkeleton />;
  }

  // TODO: nicer empty state
  if (!firstClassId) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground text-center max-w-md">
          You are not assigned as form teacher to any class for this term. Please contact your
          administrator.
        </p>
      </div>
    );
  }

  if (subjectNames.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">
          No subjects are assigned to this class for the current term.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <PrintExportHeader
          handleExport={handleExport}
          isGlobalEditing={isGlobalEditing}
          className={teacherClasses.length > 0 ? teacherClasses[0].name : null}
        />

        {/* Subject selection — dropdown and prev/next (parallel to StudentSelection) */}
        <SubjectSelection
          goToPreviousSubject={goToPreviousSubject}
          goToNextSubject={goToNextSubject}
          currentSubjectIndex={currentSubjectIndex}
          setCurrentSubjectIndex={setCurrentSubjectIndex}
          subjectNames={subjectNames}
          setSelectedSubjectName={setSelectedSubjectName}
          selectedSubjectName={selectedSubjectName}
          isGlobalEditing={isGlobalEditing}
        />

        {/* Subject sheet */}
        <Card>
          <CardContent className="p-3 md:p-8">
            {/* School header — shared with students-view */}
            <SchoolHeader school={school} academicTerm={academicTerm} />

            {/* Subject summary block */}
            <SubjectInfo
              selectedSubject={selectedSubjectName}
              enrolledStudentsCount={enrolledStudents.length}
              academicTerm={academicTerm}
              subjectStats={subjectStats}
            />

            {/* Scores table — read-only until subject-wide save is implemented */}
            <SubjectResultTable
              enrolledStudents={enrolledStudents}
              selectedSubjectName={selectedSubjectName}
              getGrade={getGrade}
              getRemark={getRemark}
              assessmentStructure={sortedAssessmentStructure}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
