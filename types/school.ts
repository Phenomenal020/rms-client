// School type representing the database structure
// When school exists: schoolName is required, other fields are nullable
// When school doesn't exist: the value is null
export type School = {
    id: string;
    schoolName: string; // Required - always present when school exists
    schoolAddress: string | null | undefined;
    schoolMotto: string | null | undefined;
    schoolTelephone: string | null | undefined;
    schoolEmail: string | null | undefined;
    // schoolLogoUrl: string | null | undefined;
    createdAt: Date;
    updatedAt: Date;
} | null;

// Type for school upsert payload (matches form values and API DTO)
export type UpsertSchoolPayload = {
    schoolName: string;
    schoolAddress?: string | undefined;
    schoolMotto?: string | undefined;
    schoolTelephone?: string | undefined;
    schoolEmail?: string | undefined;
};

export type AssessmentStructure = {
    id?: string;
    type: string;
    percentage: number;
    order: number;
};

// Type for assessment structure upsert payload (matches form values and API DTO)
export type UpsertAssessmentStructurePayload = Array<{
    id?: string;
    type: string;
    percentage: number;
    order: number;
}>;
// 