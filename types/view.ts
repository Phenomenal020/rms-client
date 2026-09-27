export type SaveSubjectScoresByIdPayload = {
    assignmentId: string;
    academicTermId: string;
    scores: Array<{
        assessmentScoreId?: string;
        studentId?: string;
        assessmentStructureId?: string;
        score: number;
    }>;
};

export type UnlockSubjectAssignmentPayload = {
    assignmentId: string;
    termId: string;
    unlockHours: number;
};

export type LockSubjectAssignmentPayload = {
    assignmentId: string;
    termId: string;
};
