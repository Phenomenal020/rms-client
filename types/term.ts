// ----------------------------------- Term types -----------------------------------
// Response shape from GET /api/v1/term/latest
// Includes more fields (like organizationId, createdAt, updatedAt) 
export type singleTermPayload = {
    id?: string;
    academicYear: string;
    term: 'FIRST' | 'SECOND' | 'THIRD';
    status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
    termDays?: number;
    termStart?: string;   // ISO date string
    termEnd?: string;     // ISO date string
    organizationId: string;
    createdAt: string;
    updatedAt: string;
};

export type getTermPayload = {
    success: string;
    data: singleTermPayload[];
}

// Payload for POST /api/v1/term — create a new term.
// Status is set to DRAFT by default
// OrganizationId derived from user session in the backend api (Extra security)
export type CreateTermPayload = {
    academicYear: string;
    term: 'FIRST' | 'SECOND' | 'THIRD';
    termDays?: number;
    termStart?: string;   // ISO date string
    termEnd?: string;     // ISO date string
};

// Payload for PATCH /api/v1/term — update mutable fields only.
// academicYear and term enum are intentionally excluded — they define the term's identity.
// Status can be updated to ACTIVE or ARCHIVED
// OrganizationId derived from user session in the backend api (Extra security)
export type UpdateTermPayload = {
    id: string | null;       // identifies the term to update (allow null for now, let api handle it)
    status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
    termDays?: number;
    termStart?: string;   // ISO date string
    termEnd?: string;     // ISO date string
};



// ----------------------------------- Assessment Structure types -----------------------------------

// get single
export type getSingleAssessmentStructure = {
    id: string;
    type: string;
    percentage: number;
    displayOrder: number;
};

// Getter payload
export type getAssessmentStructurePayload = {
    success: string;
    data: getSingleAssessmentStructure[];
}

// Create single
export type createSingleAssessmentStructure = {
    type: string;
    percentage: number;
    displayOrder: number;
};

// Create payload
export type createAssessmentStructurePayload = {
    termId: string;
    entries: createSingleAssessmentStructure[];
};

// Upsert single
export type updateSingleAssessmentStructure = {
    id: string;
    type: string;
    percentage: number;
    displayOrder: number;
};

// Update payload
export type updateAssessmentStructurePayload = {
    termId: string;
    entries: updateSingleAssessmentStructure[];
};


// ----------------------------------- Grading System types -----------------------------------

// One grade band returned from GET /grading-system
export type getSingleGradingEntry = {
    id: string | null;
    grade: string;
    minScore: number;
    maxScore: number;
    remark?: string;
};

// Response payload for GET /grading-system?termId=...
export type getGradingSystemPayload = {
    success: string;
    data: getSingleGradingEntry[];
};

// One grade band entry (e.g. A: 70–100) for POST /grading-system
export type GradingEntryPayload = {
    id?: string;
    grade: string;
    minScore: number;
    maxScore: number;
    remark?: string;
};

// Payload for POST /grading-system — save the full grading system for a term
export type SaveGradingSystemPayload = {
    termId: string;
    entries: GradingEntryPayload[];
};