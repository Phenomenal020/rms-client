export type Student = {
    id?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    department: string;
    daysPresent: number | string;   // number or ""
    subjects: Array<{ id: string; name: string }>;
}

// Type for student upsert payload (matches form values and API DTO)
export type UpsertStudentsPayload = Array<{
    id?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: "NONE" | "MALE" | "FEMALE";
    department?: "NONE" | "SCIENCE" | "ARTS" | "GENERAL";
    daysPresent?: number;
    subjects: Array<{ id: string; name: string }>;
}>;