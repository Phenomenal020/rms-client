"use client";

import useSWR from "swr"
import { fetcher } from "@/fetcher/fetcher"
import { authClient } from "@/src/auth-client"
import type { SessionListItem } from "@/src/auth-client"
import type { getAssessmentStructurePayload } from "@/types/term"
import type { subjectClassAssignmentPayload } from "@/types/enrollments";
import type { teacherOption } from "@/types/classes";

/** One row from GET /api/v1/assessment-structure?termId=… */
export type AssessmentStructureRow = getAssessmentStructurePayload & { order: number };




// get user from session (CLIENT COMPONENT ONLY - uses React hook)
export function getUser() {
    const { data, error, isLoading } = useSWR(`/api/v1/users/session`, fetcher)  // TODO: Add return type
    const result = { data, error, isLoading }

    return result
}




// get user accounts to check for password account
export function getUserAccounts(enabled: boolean = true) {
    const { data, error, isLoading } = useSWR(
        enabled ? 'auth-accounts' : null,  // only fetch if the user is available
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
        enabled ? 'auth-sessions' : null,
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
        enabled ? 'auth-current-session' : null,
        async () => {
            const response = await authClient.getSession();
            return response?.data?.session?.token ?? "";
        }
    );
    return { token: data || "", error, isLoading };  // if undefined, return empty string. Otherwise, return the token
}

export const ORG_MEMBERS_KEY = "org-members";
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
    return { teachers: data ?? [], error, isLoading };
}




// Get the academic terms for the authenticated user's school.
// Returns data: null when no term exists yet — expected on first run, not an error.
export function getTerms(enabled: boolean = true) {
    const { data, error, isLoading } = useSWR(
        enabled ? '/api/v1/terms' : null,
        fetcher,
    );
    if (data?.success) {
        return { data: data.data, error, isLoading };
    } else {
        return { data: [], error, isLoading };
    }
}

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
// Get summary stats for the authenticated org admin dashboard.
export function getOrganisationDashboard(enabled: boolean = true) {
    const { data, error, isLoading, isValidating } = useSWR(
        enabled ? '/api/v1/organisation/dashboard' : null,
        fetcher,
    );
    if (data?.success) {
        return { data: data.data as OrganisationDashboardStats, error, isLoading, isValidating };
    }
    return { data: emptyOrganisationDashboardStats, error, isLoading, isValidating };
}



// Get the grading system entries for a given academic term (requires termId in the query string)
export function getGradingSystem(termId: string) {
    const key = termId ? `/api/v1/grading-system?termId=${encodeURIComponent(termId)}` : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data, error, isLoading, isValidating };
    } else {
        return { data: [], error, isLoading, isValidating };
    }
}

// Get the assessment structure for a given academic term (requires termId in the query string)
export function getAssessmentStructure(termId: string) {
    const key = termId ? `/api/v1/assessment-structure?termId=${encodeURIComponent(termId)}` : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data, error, isLoading, isValidating };
    } else {
        return { data: [], error, isLoading, isValidating };
    }
}


// Get all subjects for the authenticated user's school
export function getSubjects(enabled: boolean = true) {
    const key = '/api/v1/subjects';
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data, error, isLoading, isValidating };
    } else {
        return { data: [], error, isLoading, isValidating };
    }
}


// Get all students for the authenticated user's school
export function getStudents(enabled: boolean = true) {
    const key = enabled ? '/api/v1/students' : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data, error, isLoading, isValidating };  // return data as the raw data
    } else {
        return { data: [], error, isLoading, isValidating };   // return data as an empty array
    }
}

// Get students assigned to a specific class (null classId suspends the fetch)
export function getEnrollments(classId: string | null, termId: string | null = null) {
    const key = classId && termId ? `/api/v1/students/enrollments?classId=${encodeURIComponent(classId)}&termId=${encodeURIComponent(termId)}` : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data, error, isLoading, isValidating };
    } else {
        return { data: [], error, isLoading, isValidating };
    }
}


// Get all classes for the authenticated user's school and a given term.
// If termId is:
//   undefined — suspend fetch (while waiting for getTerms to resolve)
//   null      — fetch without termId (classes only, no subject assignments)
//   string    — fetch with ?termId= (classes + subjects for that term)
export function getClasses(termId: string | null | undefined = null) {
    const key =
        termId === undefined
            ? null
            : termId
              ? `/api/v1/classes?termId=${encodeURIComponent(termId)}`
              : "/api/v1/classes";
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data, error, isLoading, isValidating };
    } else {
        return { data: [], error, isLoading, isValidating };
    }
}


// get all subject class assignments for a given term (null termId suspends the fetch)
export function getSubjectClassAssignments(termId: string | null) {
    const key = termId
        ? `/api/v1/classes/enrollments?termId=${encodeURIComponent(termId)}`
        : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data as subjectClassAssignmentPayload[], error, isLoading, isValidating };
    } else {
        return { data: [], error, isLoading, isValidating };
    }
}


// Get all classes for a given form teacher
export function getTeacherClasses(termId: string, enabled: boolean = true) {
    const key =
        enabled && termId
            ? `/api/v1/student-view/classes?termId=${encodeURIComponent(termId)}`
            : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data, error, isLoading, isValidating };
    } else {
        return { data: [], error, isLoading, isValidating };
    }
}


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
    error: Error | undefined;
    isLoading: boolean;
    isValidating: boolean;
} {
    const key =
        enabled && classId && termId
            ? `/api/v1/student-view/class-record?classId=${encodeURIComponent(classId)}&termId=${encodeURIComponent(termId)}`
            : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data as ClassRecordPayload, error, isLoading, isValidating };
    }
    return { data: null, error, isLoading, isValidating };
}

// 
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
            ? `/api/v1/record/requests?termId=${encodeURIComponent(termId)}`
            : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data as PendingRecordRequestRow[], error, isLoading, isValidating };
    } else {
        return { data: [], error, isLoading, isValidating };
    }
}

// export type RecordPayload = {
//     id: string;
//     requestId: string;
//     status: string;
//     content: unknown;
// }

export function getRecord(requestId: string | null, enabled: boolean = true) {
    const key =
        enabled && requestId
            ? `/api/v1/record/record?requestId=${encodeURIComponent(requestId)}`
            : null;
    const { data, error, isLoading, isValidating } = useSWR(key, fetcher);
    if (data?.success) {
        return { data: data.data.content, error, isLoading, isValidating };
    }
    return { data: null, error, isLoading, isValidating };
}



// Get the authenticated user's identity row — role, name, email, schoolId, etc.
// schoolId being non-null tells the shell a school exists without a separate fetch.
// Page-level data (terms, assessments, students) is NOT included — each page fetches its own.
export function getUserWithRelations() {
    const { data, error, isLoading } = useSWR('/api/v1/users/user', fetcher);
    return { user: data, error, isLoading };
}



export type UserWithRelations = Awaited<ReturnType<typeof getUserWithRelations>>;