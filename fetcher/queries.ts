"use client";

import useSWR from "swr"
import { fetcher } from "@/fetcher/fetcher"
import { authClient } from "@/src/auth-client"
import type { SessionListItem } from "@/src/auth-client"
import type { subjectClassAssignmentPayload } from "@/types/enrollments";
import type { teacherOption } from "@/types/classes";
import type { TeacherJoinRequestRow, OnboardingRequestRow } from "@/types/onboarding";
import {
    // users and organisation keys
    USER_SESSION_KEY,
    AUTH_ACCOUNTS_KEY,
    AUTH_SESSIONS_KEY,
    AUTH_CURRENT_SESSION_KEY,
    ORG_MEMBERS_KEY,
    USER_WITH_RELATIONS_KEY,
    // terms, grading system, and assessment structure keys
    TERMS_KEY,
    gradingSystemKey,  // <-- Requires id in query
    assessmentStructureKey,  // <-- Requires id in query
    // dashboard cards keys
    ORGANISATION_DASHBOARD_KEY,
    // subjects keys
    SUBJECTS_KEY,
    // students keys
    STUDENTS_KEY,
    studentEnrollmentsKey, // <-- Requires classId and termId in query
    // classes keys
    classesKey,
    classEnrollmentsKey, // <-- Requires termId in query
    teacherClassesKey, // <-- Requires termId in query
    classRecordKey, // <-- Requires classId and termId in query
    // record requests keys
    recordRequestsKey, // <-- Requires termId in query
    recordByRequestIdKey, // <-- Requires requestId in query
    // onboarding requests keys
    ONBOARDING_REQUESTS_KEY,
    ONBOARDING_JOIN_REQUESTS_KEY,
} from "@/fetcher/keys"

// Re-export keys that consumers import from this module for cache invalidation
export { ORG_MEMBERS_KEY } from "@/fetcher/keys"




// -------------------------------------------- API Response Shape ------------------------------------------
// API response shape used by Nest services / ResponseTransformInterceptor:
// success: boolean;
// data: T | null;
// error: string | null;
// statusCode: number | null;




// -------------------------------------------- Helper Functions ------------------------------------------
// Get the API error details from an Axios/SWR error.
// HTTP errors contain our API error envelope in response.data; network errors only have message.
function getQueryError(error: unknown, fallback: string) {
    const queryError = error as {
        message?: string;  // network error
        response?: {   // our api error envelope
            status?: number;
            data?: {
                error?: string;
                statusCode?: number;
                success?: boolean;
            };
        };
    };
    // pull the error either from the api error envelope or the network error
    return {
        error: queryError.response?.data?.error ?? queryError.message ?? fallback,
        statusCode: queryError.response?.data?.statusCode ?? queryError.response?.status ?? null,
    };
}
// One row from GET /api/v1/assessment-structure?termId=…
// export type AssessmentStructureRow = getAssessmentStructurePayload & { order: number };




// -------------------------- Users and Organisation (Better Auth non-REST API errors) --------------------------
// get user from session (CLIENT COMPONENT ONLY - uses React hook)
export function getUser() {
    const { data, error, isLoading, isValidating } = useSWR(USER_SESSION_KEY, fetcher)  // TODO: Add return type
    const result = { data, error, isLoading, isValidating }
    return result
}

// get user accounts to check for password account
export function getUserAccounts(enabled: boolean = true) {
    const { data, error, isLoading } = useSWR(
        enabled ? AUTH_ACCOUNTS_KEY : null,  // only fetch if the user is available (enabled in the client component)
        async () => {
            const response = await authClient.listAccounts();
            return response?.data || [];
        }
    );
    const hasPasswordAccount = data?.some((account: any) => account.providerId === "credential") ?? false;
    return { accounts: data, hasPasswordAccount, error, isLoading };
}

// get all user sessions 
export function getUserSessions(enabled: boolean = true) {
    const { data, error, isLoading } = useSWR(
        enabled ? AUTH_SESSIONS_KEY : null,
        async () => {
            const response = await authClient.listSessions();
            return response?.data || [];
        }
    );
    return { sessions: (data as SessionListItem[]) || [], error, isLoading };  // if undefined, return empty array. Otherwise, return the sessions
}

// get current session token
export function getCurrentSessionToken(enabled: boolean = true) {
    const { data, error, isLoading } = useSWR(
        enabled ? AUTH_CURRENT_SESSION_KEY : null,
        async () => {
            const response = await authClient.getSession();
            return response?.data?.session?.token ?? "";
        }
    );
    return { token: data || "", error, isLoading };  // if undefined, return empty string. Otherwise, return the token
}

// Org members for teacher dropdowns (Better Auth — not REST /api/v1).
export function getOrgMembers(enabled: boolean = true) {
    const { data, error, isLoading } = useSWR(
        enabled ? ORG_MEMBERS_KEY : null,
        async () => {
            const { data, error } = await authClient.organization.listMembers({ query: {} });
            if (error) throw error;  // force the error to be thrown and added to loadingError state
            if (!data?.members) {
                throw new Error("Failed to load organisation members");
            }
            return data.members.map((m) => m.user as teacherOption);
        },
    );
    return { teachers: data ?? [], error, isLoading, statusCode: error ? error.status ?? null : 200 };
}

// Get the authenticated user's identity row — role, name, email, schoolId, etc.
// Also include the user's onboarding status
// Page-level data (terms, assessments, students) is NOT included — each page fetches its own.
export function getUserWithRelations() {
    const { data, error, isLoading } = useSWR(USER_WITH_RELATIONS_KEY, fetcher);
    return { user: data, error, isLoading };
}
export type UserWithRelations = Awaited<ReturnType<typeof getUserWithRelations>>;




// ---------------------------- Terms, Grading System, and Assessment Structure -----------------------------------
// Get the academic terms for the authenticated user's (orgadmin) school.
// Empty list is a valid success when no terms exist yet — not an error.
export function getTerms(enabled: boolean = true) {
    // Make the request to the API
    const { data, error, isLoading, isValidating } = useSWR(
        enabled ? TERMS_KEY : null,
        fetcher,
    );
    // Case 1: HTTP 2xx + envelope (successfully fetched the data from the api)
    if (data?.success) {
        return {
            data: data.data ?? [],  // or an empty array if there are no terms yet
            error: null,
            isLoading,
            isValidating,
            statusCode: data.statusCode,
        };
    }
    // Case 2: HTTP 4xx/5xx errors + envelope (Made the request but got an error response from the api)
    // Case 3: Client/network failure (axios threw → SWR error)
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch terms");
        return {
            data: null,
            error: queryError.error,  // extracted as a string
            isLoading,
            isValidating,
            statusCode: queryError.statusCode,
        };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}

// Get the grading system entries for a given academic term (requires termId in the query string, orgadmin route)
export function getGradingSystem(termId: string) {
    const key = termId ? gradingSystemKey(termId) : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);  // construct the key with the termId
    // Case 1: HTTP 2xx + envelope
    if (data?.success) {
        return { data: data.data ?? [], error: null, isLoading, isValidating, statusCode: data.statusCode };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch grading system");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}

// Get the assessment structure for a given academic term (requires termId in the query string, orgadmin route)
export function getAssessmentStructure(termId: string) {
    const key = termId ? assessmentStructureKey(termId) : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    // Case 1: HTTP 2xx + envelope
    if (data?.success) {
        return { data: data.data ?? [], error: null, isLoading, isValidating, statusCode: data.statusCode };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch assessment structure");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}




// ---------------------------- Dashboard Cards-----------------------------------
export type OrganisationDashboardStats = {
    enrolledStudents: number;
    subjectsOffered: number;
    pendingRequests: number;
    approvedRequests: number;
};
const emptyOrganisationDashboardStats: OrganisationDashboardStats = {
    enrolledStudents: 0,
    subjectsOffered: 0,
    pendingRequests: 0,
    approvedRequests: 0,
};
// Get summary stats for the authenticated user's (orgadmin | teacher) dashboard.
export function getOrganisationDashboard(enabled: boolean = true) {
    const { data, error, isLoading, isValidating } = useSWR(
        enabled ? ORGANISATION_DASHBOARD_KEY : null,
        fetcher,
    );
    // Case 1: HTTP 2xx + envelope
    if (data?.success) {
        return {
            data: (data.data ?? emptyOrganisationDashboardStats) as OrganisationDashboardStats,  // use the empty one as default
            error: null,
            isLoading,
            isValidating,
            statusCode: data.statusCode,
        };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch dashboard");
        return {
            data: emptyOrganisationDashboardStats,  // use the empty one as default
            error: queryError.error,
            isLoading,
            isValidating,
            statusCode: queryError.statusCode,
        };
    }
    // First load / disabled key: no data and no error yet
    return { data: emptyOrganisationDashboardStats, error: null, isLoading, isValidating, statusCode: null };
}




// ---------------------------- Subjects -----------------------------------
// Get all subjects for the authenticated user's (orgadmin) school
export function getSubjects(enabled: boolean = true) {
    const key = enabled ? SUBJECTS_KEY : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    // Case 1: HTTP 2xx + envelope. Can have empty array if no subjects exist yet. Anything else should be null
    if (data?.success) {
        return { data: data.data ?? [], error: null, isLoading, isValidating, statusCode: data.statusCode };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch subjects");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}




// ---------------------------- Students -----------------------------------
// Get all students for the authenticated user's (orgadmin) school
export function getStudents(enabled: boolean = true) {
    const key = enabled ? STUDENTS_KEY : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    // Case 1: HTTP 2xx + envelope. Can have empty array if no students exist yet. Anything else should be null
    if (data?.success) {
        return { data: data.data ?? [], error: null, isLoading, isValidating, statusCode: data.statusCode };  // return data as the raw data
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch students");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}




// ---------------------------- Enrollments -----------------------------------
// Get students assigned to a specific class (null classId or termId suspends the fetch. orgadmin route)
export function getEnrollments(classId: string | null, termId: string | null = null) {
    const key = classId && termId ? studentEnrollmentsKey(classId, termId) : null;  // construct the key with the classId AND termId
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    // Case 1: HTTP 2xx + envelope. Can have empty array if no enrollments exist yet. Anything else should be null
    if (data?.success) {
        return { data: data.data ?? [], error: null, isLoading, isValidating, statusCode: data.statusCode };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch enrollments");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}




// ---------------------------- Classes -----------------------------------
// Get all classes for the authenticated user's  (orgadmin) school and a given term.
// If termId is:
//   undefined — suspend fetch (while waiting for getTerms to resolve)
//   null      — fetch without termId (classes only, no subject assignments)
//   string    — fetch with ?termId= (classes + subjects for that term)
export function getClasses(termId: string | null | undefined = null) {
    const key =
        termId === undefined
            ? null  // suspend fetch (while waiting for getTerms to resolve)
            : termId
                ? classesKey(termId)  // construct the key with the termId
                : classesKey(null);  // fetch without termId (classes only, no subject assignments)
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    // Case 1: HTTP 2xx + envelope: Can have empty array if no classes exist yet. Anything else should be null
    if (data?.success) {
        return { data: data.data ?? [], error: null, isLoading, isValidating, statusCode: data.statusCode };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch classes");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}

// get all subject class assignments for a given term (null termId suspends the fetch. orgadmin route)
export function getSubjectClassAssignments(termId: string | null) {
    const key = termId
        ? classEnrollmentsKey(termId)  // construct the key with the termId
        : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    // Case 1: HTTP 2xx + envelope: Can have empty array if no subject class assignments exist yet. Anything else should be null
    if (data?.success) {
        return {
            data: (data.data ?? []) as subjectClassAssignmentPayload[],
            error: null,
            isLoading,
            isValidating,
            statusCode: data.statusCode,
        };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch subject-class assignments");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}

// Get all classes for a given form teacher (teacher route)
export function getTeacherClasses(termId: string, enabled: boolean = true) {
    const key =
        enabled && termId
            ? teacherClassesKey(termId)  // construct the key with the termId
            : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    // Case 1: HTTP 2xx + envelope: Can have empty array if no classes exist yet. Anything else should be null
    if (data?.success) {
        return { data: data.data ?? [], error: null, isLoading, isValidating, statusCode: data.statusCode };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch teacher classes");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}




// ---------------------------- Class Record -----------------------------------
/** Payload from GET /api/v1/student-view/class-record (matches student-view.service getClassRecord). */
export type ClassRecordPayload = {
    classId: string;
    className: string;
    assignments: { assignmentId: string; subjectId: string; subjectName: string }[];
    students: unknown[];
};
// Get the class record for a given class and term (null classId or termId suspends the fetch)
export function getClassRecord(
    classId: string | null,
    termId: string | null,
    enabled: boolean = true,
): {
    data: ClassRecordPayload | null;
    error: string | null;
    isLoading: boolean;
    isValidating: boolean;
    statusCode: number | null;
} {
    const key =
        enabled && classId && termId
            ? classRecordKey(classId, termId)  // construct the key with the classId AND termId
            : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    // Case 1: HTTP 2xx + envelope
    if (data?.success) {
        return {
            data: data.data as ClassRecordPayload,
            error: null,
            isLoading,
            isValidating,
            statusCode: data.statusCode,
        };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch class record");
        return {
            data: null,
            error: queryError.error,
            isLoading,
            isValidating,
            statusCode: queryError.statusCode,
        };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}




// ---------------------------- Record Requests -----------------------------------
/** One row from GET /api/v1/record/requests?termId=… (pending class-record export requests). */
export type PendingRecordRequestRow = {
    id: string;
    status: string;
    createdAt: string;
    classId: string;
    className: string;
    formTeacherId: string;
    formTeacherName: string;
};
// Get pending class-record export requests for the authenticated org admin's school and term.
export function getRecentRequests(termId: string | null, enabled: boolean = true) {
    const key =
        enabled && termId
            ? recordRequestsKey(termId)  // construct the key with the termId
            : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);

    // Case 1: HTTP 2xx + envelope
    if (data?.success) {
        return {
            data: (data.data ?? []) as PendingRecordRequestRow[],
            error: null,
            isLoading,
            isValidating,
            statusCode: data.statusCode,
        };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch record requests");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}

// Get the record for a given requestId (null requestId suspends the fetch. orgadmin route)
export function getRecord(requestId: string | null, enabled: boolean = true) {
    const key =
        enabled && requestId
            ? recordByRequestIdKey(requestId)  // construct the key with the requestId
            : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);

    // Case 1: HTTP 2xx + envelope: Can have null if no record exists yet. Anything else should be null
    if (data?.success) {
        return {
            data: data.data?.content ?? null,
            error: null,
            isLoading,
            isValidating,
            statusCode: data.statusCode,
        };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch record");
        return {
            data: null,
            error: queryError.error,
            isLoading,
            isValidating,
            statusCode: queryError.statusCode,
        };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}




// ---------------------------- Onboarding Requests -----------------------------------
// Get all school onboarding requests (platform admin route)
export function getOnboardingRequests(enabled: boolean = true) {
    const key = enabled ? ONBOARDING_REQUESTS_KEY : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    // Case 1: HTTP 2xx + envelope: Can have empty array if no onboarding requests exist yet. Anything else should be null
    if (data?.success) {
        return {
            data: (data.data ?? []) as OnboardingRequestRow[],
            error: null,
            isLoading,
            isValidating,
            statusCode: data.statusCode,
        };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch onboarding requests");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}

// Get pending teacher join requests for the authenticated org admin's school (orgadmin route)
export function getTeacherJoinRequests(enabled: boolean = true) {
    const key = enabled ? ONBOARDING_JOIN_REQUESTS_KEY : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    // Case 1: HTTP 2xx + envelope: Can have empty array if no teacher join requests exist yet. Anything else should be null
    if (data?.success) {
        return {
            data: (data.data ?? []) as TeacherJoinRequestRow[],
            error: null,
            isLoading,
            isValidating,
            statusCode: data.statusCode,
        };
    }
    // Case 2 and 3: HTTP 4xx/5xx or client/network failure
    if (error) {
        const queryError = getQueryError(error, "Failed to fetch teacher join requests");
        return { data: null, error: queryError.error, isLoading, isValidating, statusCode: queryError.statusCode };
    }
    // First load / disabled key: no data and no error yet
    return { data: null, error: null, isLoading, isValidating, statusCode: null };
}