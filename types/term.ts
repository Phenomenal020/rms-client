// Type for term upsert payload (matches form values and API DTO)
export type UpsertTermPayload = {
    academicYear: string;
    className: string;
    term: 'FIRST' | 'SECOND' | 'THIRD';
    termDays?: number | undefined;
    termStart?: string | undefined;
    termEnd?: string | undefined;
    resultTemplateUrl?: string | undefined;
    gradingSystem?: Array<{
        grade: string;
        minScore: number;
        maxScore: number;
        remark?: string | null;
    }> 
};

// Type for grading entry
export type GradingEntry = {
    grade: string;
    minScore: number | string;
    maxScore: number | string;
}