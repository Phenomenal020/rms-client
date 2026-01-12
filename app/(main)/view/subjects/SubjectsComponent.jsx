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

const SubjectsPage = ({ user, academicTerm }) => {


  // --------------------------------------------------------------------------------
  // State Management. Prefer the provided academic term. Fall back to the user's academic term.
  const termData = academicTerm || user?.academicTerms?.[0];

  // Pre-compute subject names (minimal shaping to avoid heavy transforms).
  const subjectNames = useMemo(
    () => (termData?.subjects || []).map((subject) => subject.name),
    [termData?.subjects]
  );  // Only recompute these if the subjects change

  // Memoise the grading functions 
  const { getGrade, getRemark } = useMemo(
    () => createGradingFunctions(termData?.gradingSystem),
    [termData?.gradingSystem]
  );  // Only recompute these if the grading system changes

  // students state - all students from db
  const [students, setStudents] = useState(termData?.students || []);

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
  const [editingSubjectData, setEditingSubjectData] = useState({});
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editingStudents, setEditingStudents] = useState([]);

  // global editing state - to disable other component action buttons when editing in one component
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);

  // school state: data + flag
  const [schoolData, setSchoolData] = useState(termData?.school || user?.school);
  const [editingSchoolData, setEditingSchoolData] = useState(null);

  // Sync local state when term data changes
  useEffect(() => {
    setStudents(termData?.students || []);
    setSchoolData(termData?.school || user?.school);
    setSelectedSubjectName(subjectNames[0] || null);

    if (subjectNames.length > 0) {
      setSelectedSubjectName(subjectNames[0]);
      setCurrentSubjectIndex(0);
    } else {
      setSelectedSubjectName(null);
      setCurrentSubjectIndex(0);
    }
  }, [termData?.id, termData?.students, termData?.school, subjectNames, user?.school]);

  // -------------------------------------------------------------------------------------



  // --------------------------------------------------------------------------------
  // Navigation Functions - Previous and Next Subject Buttons

  // These would trigger a re-evaluation of the enrolled students for the selected subject
  // Previous subject - decrease the current subject index by 1 and set the selected subject to the new index
  const goToPreviousSubject = () => {
    if (currentSubjectIndex > 0 && subjectNames.length > 0) {
      const newIndex = currentSubjectIndex - 1;
      setCurrentSubjectIndex(newIndex);
      setSelectedSubjectName(subjectNames[newIndex]);
    }
  };

  // Next subject - increase the current subject index by 1 and set the selected subject to the new index
  const goToNextSubject = () => {
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
        ? calculateSubjectStats(selectedSubjectName, enrolledStudents, termData?.assessmentStructure || [])
        : null,
    [selectedSubjectName, enrolledStudents, termData?.assessmentStructure]
  );

  // --------------------------------------------------------------------------------





  // --------------------------------------------------------------------------------
  // Edit/Save Scores Functions

  // Edit functions - start editing scores (copy the enrolled students into the editing students state) and update isEditingScores to true to render input fields (spans when not editing, input when editing)
  const startEditingScores = () => {
    setIsEditingScores(true);
    setEditingStudents(enrolledStudents || []);
    setIsGlobalEditing(true);
  };

  // Edit functions - cancel editing scores
  const cancelEditingScores = () => {
    setIsEditingScores(false);
    setEditingStudents([]);
    setIsGlobalEditing(false);
  };

  // Edit functions - Updates the local state of the enrolled students for the selected subject
  const saveScoreChanges = (updatedStudentsFromForm = []) => {
  
    // The payload here should not be empty as this function is only called after a form submission with the new student data
    const hasFormPayload = Array.isArray(updatedStudentsFromForm) && updatedStudentsFromForm.length > 0;
    if (!hasFormPayload) {
      return;
    }   // if it is empty, do nothing

    // Update the local state of the students (enrolled students derives from this)
    setStudents(prevStudents =>
      prevStudents.map((student) => {
        // find students with data to be updated
        const match = updatedStudentsFromForm.find(
          (s) =>
            s.studentId === student.id ||
            s.studentId === student.studentId ||
            s.studentId === String(student.id)
        );
        if (!match) return student;

        // Update only the selected subject's assessments 
        const updatedSubjects = (student.subjects || []).map((subject) => {
          const isSelected =
            subject.subject?.name === selectedSubjectName ||
            subject.name === selectedSubjectName
          if (!isSelected) return subject;  // skip unaffected subjects

          const assessments = Array.isArray(subject.assessments)
            ? [...subject.assessments]
            : [];

          const firstAssessment = assessments[0]  // where the scores actully are
            ? { ...assessments[0] }
            : { scores: [] };

          // Build the new scores array from the form payload
          firstAssessment.scores = match.scores.map((score) => ({
            ...score,
          }));

          assessments[0] = firstAssessment;

          return {
            ...subject,
            assessments,
          };
        });

        // if we actually make changes, then update the student's subjects with the updated subjects (containing the new scores)
        return {
          ...student,
          subjects: updatedSubjects,
        };
      })
    );
    setIsEditingScores(false);
    setIsGlobalEditing(false);
  };

  // // Edit functions - handle score change
  // const handleScoreChange = (studentIndex, assessmentStructureId, value) => {
  //   const numValue = Number(value) || 0;
  //   setEditingStudents((prev) => {
  //     if (!prev || prev.length === 0) return prev;

  //     const newStudents = [...prev];
  //     const student = { ...newStudents[studentIndex] };

  //     const subjectIndex = student.subjects?.findIndex(
  //       (s) => s.subject?.name === selectedSubject || s.name === selectedSubject
  //     );

  //     if (subjectIndex === undefined || subjectIndex < 0) {
  //       newStudents[studentIndex] = student;
  //       return newStudents;
  //     }

  //     const subject = { ...student.subjects[subjectIndex] };
  //     const assessments = Array.isArray(subject.assessments)
  //       ? [...subject.assessments]
  //       : [];
  //     const existingAssessment = assessments[0]
  //       ? { ...assessments[0] }
  //       : { scores: [] };
  //     const scores = Array.isArray(existingAssessment.scores)
  //       ? [...existingAssessment.scores]
  //       : [];

  //     const scoreIndex = scores.findIndex(
  //       (s) => s.assessmentStructureId === assessmentStructureId
  //     );

  //     if (scoreIndex >= 0) {
  //       scores[scoreIndex] = { ...scores[scoreIndex], score: numValue };
  //     } else {
  //       scores.push({ assessmentStructureId, score: numValue });
  //     }

  //     existingAssessment.scores = scores;
  //     assessments[0] = existingAssessment;
  //     subject.assessments = assessments;

  //     const updatedSubjects = [...student.subjects];
  //     updatedSubjects[subjectIndex] = subject;
  //     student.subjects = updatedSubjects;

  //     newStudents[studentIndex] = student;
  //     return newStudents;
  //   });
  // };
  // --------------------------------------------------------------------------------







  // --------------------------------------------------------------------------------
  // Edit/Save School Information Functions

  // Edit functions - start editing school data
  const startEditingSchool = () => {
    setEditingSchoolData({ ...schoolData });
    setIsEditingSchool(true);
    setIsGlobalEditing(true);
  };

  // Edit functions - cancel editing school data
  const cancelEditingSchool = () => {
    setEditingSchoolData({});
    setIsEditingSchool(false);
    setIsGlobalEditing(false);
  };

  // Edit functions - save editing school data
  const saveSchoolChanges = () => {
    setSchoolData(editingSchoolData);
    setIsEditingSchool(false);
    setIsGlobalEditing(false);
  };

  // -------------------------------------------------------------------




  // --------------------------------------------------------------------------------
  // Print and Export Functions

  // Todo: Handle Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Todo: Handle Export functionality
  const handleExport = () => {
    toast.success("Subject sheet exported successfully!");
  };

  // --------------------------------------------------------------------------------




  // if there are no subjects, show a message
  if (!selectedSubjectName) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">No subjects available</p>
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

            {/* Subject Information (no editing required) */}
            <SubjectInfo
              selectedSubject={termData?.subjects?.find(subject => subject.name === selectedSubjectName)?.name || ""}
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
              // handleScoreChange={handleScoreChange}
              getStudentScores={getStudentScores}
              getGrade={getGrade}
              getRemark={getRemark}
              assessmentStructure={termData?.assessmentStructure || []}
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