"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { toast } from "sonner";

// components
import { PrintExportHeader } from "./printExportHeader";
import { SubjectSelection } from "./subjectSelection";
import { SchoolHeader } from "@/app/(main)/view/results/schoolHeader";
import { SubjectInfo } from "./subjectInfo";
import { SubjectResultTable } from "./subjectResultTable";
import Loading from "./loading";

// helpers and utils
import { calculateSubjectStats, getStudentScores, getEnrolledStudents } from "./helpers";
import createGradingFunctions from "./utils/gradingFns";
import { useUser } from "@/contexts/user-context";
import type { Student, AcademicTerm } from "@/types/drizzle";

const SubjectsPage = () => {
  // --------------------------------------------------------------------------------
  // Get user information from context
  const {
    academicTerm: termData,
    assessmentStructure,
    gradingEntry,
    students: userStudents,
    subjects,
    school,
    isLoading,
    error
  } = useUser();

  // Pre-compute subject names (minimal shaping to avoid heavy transforms).
  const subjectNames = useMemo(
    () => (subjects || []).map((subject) => subject.name),
    [subjects]
  );  // Only recompute these if the subjects change

  // Memoise the grading functions 
  const { getGrade, getRemark } = useMemo(
    () => createGradingFunctions(gradingEntry),
    [gradingEntry]
  );  // Only recompute these if the grading entry changes

  // students state - all students from db
  const [students, setStudents] = useState<Student[]>(userStudents || []);

  // subjects state: gets enrolled students for the selected subject
  const [selectedSubjectName, setSelectedSubjectName] = useState(subjectNames[0] || null);  // default as first subject
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0); // current subject index to track the current subject
  const enrolledStudents = useMemo(
    () =>
      selectedSubjectName ? getEnrolledStudents(selectedSubjectName, students) : [],
    [selectedSubjectName, students]
  );  // Memoise this operation to get enrolled students for the selected subject

  // editing states: editing scores flag + data
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editingStudents, setEditingStudents] = useState<Student[]>([]);

  // global editing state - to disable other component action buttons when editing in one component
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);

  // Sync local state when data changes
  useEffect(() => {
    if (userStudents) {
      setStudents(userStudents);
    }

    // Reset subject selection when subjects list changes
    if (subjectNames.length > 0) {
      setSelectedSubjectName(subjectNames[0]);
      setCurrentSubjectIndex(0);
    } else {
      setSelectedSubjectName(null);
      setCurrentSubjectIndex(0);
    }
  }, [userStudents, subjectNames]);
  // -------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------
  // Navigation Functions - Previous and Next Subject Buttons
  // These would trigger a re-evaluation of the enrolled students for the selected subject
  // Previous subject - decrease the current subject index by 1 and set the selected subject to the new index
  const goToPreviousSubject = (): void => {
    if (currentSubjectIndex > 0 && subjectNames.length > 0) {
      const newIndex = currentSubjectIndex - 1;
      setCurrentSubjectIndex(newIndex);
      setSelectedSubjectName(subjectNames[newIndex]);
    }
  };

  // Next subject - increase the current subject index by 1 and set the selected subject to the new index
  const goToNextSubject = (): void => {
    if (currentSubjectIndex < subjectNames.length - 1 && subjectNames.length > 0) {
      const newIndex = currentSubjectIndex + 1;
      setCurrentSubjectIndex(newIndex);
      setSelectedSubjectName(subjectNames[newIndex]);
    }
  };

  // --------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------
  // Subject Stats Functions - Calculate the subject stats
  // Calculate the subject stats for the selected subject. Do this anytime 1) selected subject 2) enrolled students or 3) assessment structure changes
  // Memoise the derived subject stats
  const subjectStats = useMemo(
    () =>
      selectedSubjectName
        ? calculateSubjectStats(selectedSubjectName, enrolledStudents, assessmentStructure || [])
        : null,
    [selectedSubjectName, enrolledStudents, assessmentStructure]
  );

  // --------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------
  // Edit/Save Scores Functions
  // Edit functions - start editing scores (copy the enrolled students into the editing students state) and update isEditingScores to true to render input fields (spans when not editing, input when editing)
  const startEditingScores = (): void => {
    setIsEditingScores(true);
    setEditingStudents(enrolledStudents || []);
    setIsGlobalEditing(true);
  };

  // Edit functions - cancel editing scores
  const cancelEditingScores = (): void => {
    setIsEditingScores(false);
    setEditingStudents([]);
    setIsGlobalEditing(false);
  };

  // --------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------
  // Print and Export Functions
  // Todo: Handle Print functionality
  const handlePrint = (): void => {
    window.print();
  };

  // Todo: Handle Export functionality
  const handleExport = (): void => {
    toast.success("Subject sheet exported successfully!");
  };
  // --------------------------------------------------------------------------------

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-destructive text-sm md:text-base">
          Failed to load data. Please try again later.
        </p>
      </div>
    );
  }

  // if there are no subjects, show a message
  if (!selectedSubjectName) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground text-sm md:text-base">No subjects available</p>
      </div>
    );
  }
  // --------------------------------------------------------------------------------



  // if there are subjects, show the subjects page
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header - contains print and export buttons */}
        <PrintExportHeader handlePrint={handlePrint} handleExport={handleExport} isGlobalEditing={isGlobalEditing} />

        {/* Subject Selection - name and <- -> buttons to navigate through the subjects */}
        <SubjectSelection
          goToPreviousSubject={goToPreviousSubject}
          goToNextSubject={goToNextSubject}
          currentSubjectIndex={currentSubjectIndex}
          setCurrentSubjectIndex={setCurrentSubjectIndex} // update the current subject index based on the select dropdown
          subjectNames={subjectNames}
          setSelectedSubjectName={setSelectedSubjectName}
          selectedSubjectName={selectedSubjectName}
          isGlobalEditing={isGlobalEditing}
        />

        {/* Subject Sheet */}
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-3 md:p-8">
            {/* School Header - display only */}
            {termData && school && (
              <SchoolHeader
                school={school}
                academicTerm={termData}
              />
            )}

            {/* Subject Information + Stats */}
            <SubjectInfo
              selectedSubject={subjects?.find(subject => subject.name === selectedSubjectName)?.name || ""}
              enrolledStudentsCount={enrolledStudents.length}
              term={termData?.term}
              academicYear={termData?.academicYear}
              subjectStats={subjectStats}
            />

            {/* Academic Performance */}
            <SubjectResultTable
              isEditingScores={isEditingScores}
              startEditingScores={startEditingScores}
              cancelEditingScores={cancelEditingScores}
              editingStudents={editingStudents}
              enrolledStudents={enrolledStudents}
              selectedSubjectName={selectedSubjectName}
              getStudentScores={getStudentScores}
              getGrade={getGrade}
              getRemark={getRemark}
              assessmentStructure={assessmentStructure || []}
              isGlobalEditing={isGlobalEditing}
              academicTermId={termData?.id}
              setIsGlobalEditing={setIsGlobalEditing}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubjectsPage;