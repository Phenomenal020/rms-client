// Payload for POST /api/v1/onboarding/create-request
export type createOnboardingRequestPayload = {
    organisationName: string;
    organisationAddressLine1: string;
    organisationCity: string;
    organisationState: string;
    organisationPostalCode: string;
    organisationCountry: string;
    contactEmail: string;
    contactPhone: string;
};

// Payload for POST /api/v1/onboarding/join-request
export type createTeacherJoinRequestPayload = {
    schoolRegistrationId: string;
};

/** One row from GET /api/v1/onboarding/requests (platform admin school onboarding). */
export type OnboardingRequestRow = {
    id: string;
    userId: string;
    organisationName: string;
    organisationAddressLine1: string;
    organisationCity: string;
    organisationState: string;
    organisationPostalCode: string;
    organisationCountry: string;
    contactEmail: string;
    contactPhone: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | string;
    rejectionReason?: string | null;
    createdAt: string;
    updatedAt?: string;
    reviewedBy?: string | null;
    organisationId?: string | null;
};

/** One row from GET /api/v1/onboarding/join-requests (pending teacher join requests for an org admin). */
export type TeacherJoinRequestRow = {
    id: string;
    status: string;
    createdAt: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    name: string;
};

// Payload for PUT .../reject endpoints
export type RejectRequestPayload = {
    rejectionReason: string;
};

// Client accept teacher join: server owns add-member; only requestId is required
export type AcceptTeacherJoinRequestPayload = {
    requestId: string;
};
