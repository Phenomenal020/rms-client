// Type for saving student assessment scores (student-view)
export type SaveStudentScoresPayload = {
    studentId: string;
    academicTermId: string;
    studentSubjects: Array<{
        subjectId: string;
        scores: Array<{
            assessmentStructureId: string;
            score: number;
        }>;
    }>;
};

// Type for saving subject assessment scores (subject-view)
export type SaveSubjectScoresPayload = {
    subjectId: string;
    academicTermId: string;
    studentsData: Array<{
        studentId: string;
        scores: Array<{
            assessmentStructureId: string;
            score: number;
        }>;
    }>;
};
