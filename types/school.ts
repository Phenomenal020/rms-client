// School type representing the database structure
// When school exists: schoolName is required, other fields are nullable
// When school doesn't exist: the value is null
export type School = {
    id: string;
    schoolName: string; // Required - always present when school exists
    schoolRegistrationId: string; // Server-generated UUID, shared with teachers to join the school
    // Optional stuff
    schoolAddress: string | null | undefined;
    schoolMotto: string | null | undefined;
    schoolTelephone: string | null | undefined;
    schoolEmail: string | null | undefined;
    // schoolLogoUrl: string | null | undefined;  TODO
    createdAt: Date;
    updatedAt: Date;
} | null;

// Type for school upsert payload (matches form values and API DTO)
// schoolRegistrationId is never sent by the client — it is server-generated
export type UpsertSchoolPayload = {
    schoolName: string;
    schoolAddress?: string | null | undefined;
    schoolMotto?: string | null | undefined;
    schoolTelephone?: string | null | undefined;
    schoolEmail?: string | null | undefined;
};

// Response from POST /school — includes the generated registration ID
export type CreateSchoolResponse = {
    success: string;
    schoolRegistrationId: string;
};

// Response from PATCH /school
export type UpdateSchoolResponse = {
    success: string;
};
