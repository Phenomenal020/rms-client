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
import { SubjectStats } from "./subjectStats";

// helpers and utils
import { calculateSubjectStats, getStudentScores, getEnrolledStudents } from "./helpers";
import createGradingFunctions from "./utils/gradingFns";
import { useUser } from "@/contexts/user-context";
import type { Student, AssessmentStructure, AcademicTerm, School, GradingEntry } from "@/types/drizzle";

// Type for assessment score used in forms
export type AssessmentScore = {
  assessmentStructureId: string;
  score: number;
};

const SubjectsPage = () => {
  // --------------------------------------------------------------------------------
  // Get user information from context
  const { academicTerm: termData, assessmentStructure, gradingEntry, students: userStudents, subjects, school } = useUser();

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

  // editing states: school, subject flag + data,  editing scores flag + data
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editingSubjectData, setEditingSubjectData] = useState<Record<string, unknown>>({});
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editingStudents, setEditingStudents] = useState<Student[]>([]);

  // global editing state - to disable other component action buttons when editing in one component
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);

  // school state: data + flag
  const [schoolData, setSchoolData] = useState<School | null>(school || null);
  const [editingSchoolData, setEditingSchoolData] = useState<School | null>(null);

  // Sync local state when data changes
  useEffect(() => {
    if (userStudents) {
      setStudents(userStudents);
    }
    if (school) {
      setSchoolData(school);
    }
    
    // Reset subject selection when subjects list changes
    if (subjectNames.length > 0) {
      setSelectedSubjectName(subjectNames[0]);
      setCurrentSubjectIndex(0);
    } else {
      setSelectedSubjectName(null);
      setCurrentSubjectIndex(0);
    }
  }, [userStudents, school, subjectNames]);
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

  // Edit functions - Updates the local state of the enrolled students for the selected subject
  const saveScoreChanges = (updatedStudentsFromForm: Array<{ studentId: string; scores: AssessmentScore[] }> = []): void => {
    // The payload here should not be empty as this function is only called after a form submission with the new student data
    const hasFormPayload = Array.isArray(updatedStudentsFromForm) && updatedStudentsFromForm.length > 0;
    if (!hasFormPayload) {
      return;
    }  // safeGuard

    // Update the local state of the students (enrolled students derives from this)
    setStudents(prevStudents =>
      prevStudents.map((student) => {
        // Find students with data to be updated
        const match = updatedStudentsFromForm.find(
          (s) =>
            s.studentId === student.id ||
            s.studentId === String(student.id)
        );
        // if there is no match, return the student as is
        if (!match) return student;

        // Update only the selected subject's assessments 
        const updatedSubjects = (student.subjects || []).map((subject: any) => {
          const isSelected = subject.subject?.name === selectedSubjectName;
          if (!isSelected) return subject;  // skip unaffected subjects

          // Get existing assessments array
          const assessments = Array.isArray(subject.assessments)
            ? [...subject.assessments]
            : [];

          // Get existing assessment
          const existingAssessment = assessments[0];
          if (!existingAssessment) {
            // If no assessment exists, we can't update it locally
            return subject;
          }

          const existingScores = existingAssessment.scores || [];

          // Build the new scores array from the form payload
          // Map form scores to existing score structure, preserving existing score objects where possible
          const updatedScores = match.scores.map((formScore) => {
            // Try to find existing score with same assessmentStructureId
            const existingScore = existingScores.find(
              (s: any) => s.assessmentStructureId === formScore.assessmentStructureId
            );
            // If exists, update score value; otherwise keep the form score (will be handled by server)
            if (existingScore) {
              return { ...existingScore, score: formScore.score };
            }
            // For new scores that don't exist yet, return the form score
            // This is a temporary state - the server has the real data
            return formScore as typeof existingScores[0];
          });

          // Update the assessment with new scores
          assessments[0] = { ...existingAssessment, scores: updatedScores };

          return {
            ...subject,
            assessments,
          };
        });

        // Update the student's subjects with the updated subjects (containing the new scores)
        return {
          ...student,
          subjects: updatedSubjects,
        };
      })
    );

    setIsEditingScores(false);
    setIsGlobalEditing(false);
  };
   
  //
  // --------------------------------------------------------------------------------




  // --------------------------------------------------------------------------------
  // Edit/Save School Information Functions

  // Edit functions - start editing school data
  const startEditingSchool = (): void => {
    if (schoolData) {
      setEditingSchoolData({ ...schoolData });
    }
    setIsEditingSchool(true);
    setIsGlobalEditing(true);
  };

  // Edit functions - cancel editing school data
  const cancelEditingSchool = (): void => {
    setEditingSchoolData(null);
    setIsEditingSchool(false);
    setIsGlobalEditing(false);
  };

  // Edit functions - save editing school data
  const saveSchoolChanges = (updatedSchool: School | null): void => {
    if (updatedSchool) {
      setSchoolData(updatedSchool);
      setEditingSchoolData(null);
    }
    setIsEditingSchool(false);
    setIsGlobalEditing(false);
  };

  // -------------------------------------------------------------------




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




  // if there are no subjects, show a message
  if (!selectedSubjectName) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500 text-sm md:text-base">No subjects available</p>
      </div>
    );
  }



  // if there are subjects, show the subjects page
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

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
          <CardContent className="p-8">
            {/* School Header Containing School info + save/edit functions */}
            {termData && (
              <SchoolHeader
                isEditingSchool={isEditingSchool}
                startEditingSchool={startEditingSchool}
                saveSchoolChanges={saveSchoolChanges}
                cancelEditingSchool={cancelEditingSchool}
                editingSchoolData={editingSchoolData}
                setEditingSchoolData={setEditingSchoolData}
                school={schoolData}
                academicTerm={termData}
                isGlobalEditing={isGlobalEditing}
              />
            )}

            {/* Subject Information (no editing required) */}
            <SubjectInfo
              selectedSubject={subjects?.find(subject => subject.name === selectedSubjectName)?.name || ""}
              enrolledStudentsCount={enrolledStudents.length}
              term={termData?.term}
              academicYear={termData?.academicYear}
            />

            {/* Academic Performance */}
            <SubjectResultTable
              isEditingScores={isEditingScores}
              startEditingScores={startEditingScores}
              saveScoreChanges={saveScoreChanges}
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
            />

            {/* Summary Statistics */}
            {subjectStats && <SubjectStats subjectStats={subjectStats} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubjectsPage;