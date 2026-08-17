// Create subject payload
export type createSubjectPayload = {
    name: string;
    department: string;
};

// Update subject payload
export type updateSubjectPayload = {
    id: string;
    name?: string;
    department?: string;
};

// Delete subject payload
export type deleteSubjectPayload = {
    id: string;
};

// Single get subject
export type singleGetSubjectPayload = {
    id: string;
    name: string;
    department: string;
    createdAt: string;
    updatedAt: string;
}

// Get subjects payload
export type getSubjectPayload = {
    success: boolean;
    error: string | null;
    data: singleGetSubjectPayload[]
}