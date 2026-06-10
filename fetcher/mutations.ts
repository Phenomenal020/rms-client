// source: https://deepwiki.com/vercel/swr/3.3-useswrmutation
"use client";

import { axiosInstance } from "./fetcher"
import { ORG_MEMBERS_KEY } from "./queries"
import { useSWRConfig } from "swr"
import type { UserData } from "@/types/updateProfile"
import useSWRMutation from "swr/mutation"
import type { CreateTermPayload, UpdateTermPayload, SaveGradingSystemPayload } from "@/types/term"
import type { createSingleStudent, updateSingleStudent } from "@/types/students"
import type { SaveClassRecordExportPayload, SaveStudentScoresPayload, SaveSubjectScoresPayload } from "@/types/view"
import type { AddMemberPayload } from "@/types/organisation"
import type { createSubjectPayload, updateSubjectPayload } from "@/types/subjects";
import type { createClassPayload, updateClassPayload } from "@/types/classes";
import type { createAssessmentStructurePayload, updateAssessmentStructurePayload } from "@/types/term";
import type { SaveEnrollmentPayload } from "@/types/enrollments";


// Save grading system for a term — POST /api/v1/grading-system (full replace)
export function useSaveGradingSystem() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/grading-system',
        async (_url, { arg }: { arg: SaveGradingSystemPayload }) => {
            const { termId, ...body } = arg;
            const response = await axiosInstance.post(`/api/v1/grading-system/${termId}`, body);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate('/api/v1/grading-system');
            },
        },
    );
    return {
        saveGradingSystem: trigger,
        isMutating,
        error,
        data,
    };
}




// Shared utility to extract error message from caught errors (axios or generic)
export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred. Please try again."): string {
    const error = err as any;
    const message = error?.response?.data?.message;
    if (Array.isArray(message)) {
        return message.join(", ");
    }
    return message || error?.message || fallback;
}

// get the http status code from the error
export function getHttpStatus(err: unknown): number | undefined {
    const status = (err as { response?: { status?: number } })?.response?.status;
    return typeof status === "number" ? status : undefined;
}

// get the api error message from the error (401? 403? -> redirect. Otherwise, show error or fallback)
export function getApiErrorMessage(
    err: unknown,
    fallback = "An unexpected error occurred. Please try again.",
): string {
    const status = getHttpStatus(err);
    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "You don't have permission to perform this action.";
    return getErrorMessage(err, fallback);
}





// update user profile
export function useUpdateProfile() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/users/profile',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: Partial<UserData> }) => {
            // SWR automatically passes the key as the 'url' parameter
            const response = await axiosInstance.patch(url, arg);  // use it to make the api call
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after update
                // Since getUser() uses '/users/session', we invalidate it
                mutate(`/api/v1/users/session`);
            },
        }
    );

    return {
        updateProfile: trigger,
        isMutating,
        error,
        data,
    };
}



// add member to organisation — POST /api/v1/organisation/add-member
export function useAddMember() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/organisation/add-member',
        async (url, { arg }: { arg: AddMemberPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(ORG_MEMBERS_KEY);
            },
        },
    );

    return {
        addMemberClient: trigger,
        isMutating,
        error,
        data
    };
}


// -------------Term, Assessment Structure and Grading System mutations -------------------------
// create term — POST /api/v1/term
export function useCreateTerm() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/term',
        async (url, { arg }: { arg: CreateTermPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate so getLatestTerm() refetches and all three cards see the new term.
                mutate('/api/v1/terms');
            },
        }
    );

    return {
        trigger,
        isMutating,
        error,
        data,
    };
}

// update term — PATCH /api/v1/term
export function useUpdateTerm() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/terms',
        async (_url, { arg }: { arg: UpdateTermPayload }) => {
            const { id, ...body } = arg;
            const response = await axiosInstance.patch(`/api/v1/terms/${id}`, body);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate so getTerms() refetches the updated dates/days.
                mutate('/api/v1/terms');
            },
        }
    );

    return {
        trigger,
        isMutating,
        error,
        data,
    };
}

// Create assessment structure for a term — Post /api/v1/assessment-structure
export function useCreateAssessmentStructure() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/assessment-structure',
        async (_url, { arg }: { arg: createAssessmentStructurePayload }) => {
            const response = await axiosInstance.post('/api/v1/assessment-structure', arg);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate('/api/v1/assessment-structure');
            },
        },
    );
    return {
        trigger,
        isMutating,
        error,
        data,
    };
}

// Update assessment structure for a term — Patch /api/v1/assessment-structure/{termId}
export function useUpdateAssessmentStructure() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/assessment-structure',
        async (_url, { arg }: { arg: updateAssessmentStructurePayload }) => {
            const { termId, ...body } = arg;
            const response = await axiosInstance.patch(`/api/v1/assessment-structure/${termId}`, body);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate('/api/v1/assessment-structure');
            },
        },
    );
    return {
        trigger,
        isMutating,
        error,
        data,
    };
}



// ----------------------------- Subjects mutations -----------------------------
// create a subject
export function useCreateSubject() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/subjects',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: createSubjectPayload }) => {
            // SWR automatically passes the key as the 'url' parameter. Using POST for upsert (create or update)
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh subjects data after creation
                mutate('/api/v1/subjects');  // for views to get fresh subject data
            }
        }
    );

    return {
        trigger,
        isMutating,
        error,
        data,
    };
}

// Update a subject
export function useUpdateSubject() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/subjects',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: updateSubjectPayload }) => {
            // Destructure the id from the arg. It should go in the url as a query param
            const { id, ...body } = arg;
            const response = await axiosInstance.patch(`/api/v1/subjects/${id}`, body);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh subjects data after creation
                mutate('/api/v1/subjects');  // for views to get fresh subject data
            }
        }
    );

    return {
        trigger,
        isMutating,
        error,
        data,
    };
}


// ----------------------------- Classes mutations -----------------------------
export function useCreateClass() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        "/api/v1/classes",
        async (url, { arg }: { arg: createClassPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // revalidate all class keys with a prefix matcher 
                mutate(
                    (key) => typeof key === "string" && key.startsWith("/api/v1/classes"),
                    undefined,
                    { revalidate: true },
                );
            },
        },
    );
    return { trigger, isMutating, error, data };
}

export function useUpdateClass() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        "/api/v1/classes",
        async (url, { arg }: { arg: { id: string } & updateClassPayload }) => {
            const { id, ...body } = arg;   // id === termId
            const response = await axiosInstance.patch(`/api/v1/classes/${id}`, body);
            return response.data;
        },
        {
            onSuccess: () => {
                // revalidate all class keys with a prefix matcher 
                mutate(
                    (key) => typeof key === "string" && key.startsWith("/api/v1/classes"),
                    undefined,
                    { revalidate: true },
                );
            },
        },
    );
    return { trigger, isMutating, error, data };
}



// ----------------------------- Students mutations -----------------------------
// create a student
export function useCreateStudent() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/students',
        async (url, { arg }: { arg: createSingleStudent }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh students data after creation
                mutate('/api/v1/students');  // for views to get fresh student data
            }
        }
    );

    return {
        trigger,
        isMutating,
        error,
        data,
    };
}

// update a student
export function useUpdateStudent() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/students',
        async (url, { arg }: { arg: updateSingleStudent }) => {
            const { id, ...body } = arg;
            const response = await axiosInstance.patch(`/api/v1/students/${id}`, body);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh students data after creation
                mutate('/api/v1/students');
            }
        }
    );

    return {
        trigger,
        isMutating,
        error,
        data,
    };
}


// save a student's subject enrollments (students)
export function useSaveEnrollment() {
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/students/enrollment',
        async (url, { arg }: { arg: SaveEnrollmentPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
    );
    return {
        trigger,
        isMutating,
        error,
        data,
    };
}




/** Submit class record snapshot for export / admin approval — POST placeholder until the Nest route exists. */
export function useSaveRecord() {
    const { trigger, isMutating, error, data } = useSWRMutation(
        "/api/v1/student-view/export",
        async (url, { arg }: { arg: SaveClassRecordExportPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
    );
    return {
        saveRecord: trigger,
        isMutating,
        error,
        data,
    };
}

/** Org admin accept — PATCH /api/v1/record/accept?requestId=... */
export function useAcceptRequest() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        "/api/v1/record/accept",  // key - used by SWR for cache identification
        async (url, { arg: requestId }: { arg: string }) => {
            const response = await axiosInstance.patch(
                `${url}?requestId=${encodeURIComponent(requestId)}`,
            );
            return response.data;
        },
        {
            onSuccess: (response) => {
                const requestId = response?.data?.id;

                mutate(
                    (key) =>
                        typeof key === "string" && key.startsWith("/api/v1/record/requests"),
                    undefined,
                    { revalidate: true },
                );
                mutate("/api/v1/organisation/dashboard");  // dashboard card items

                if (requestId) {
                    mutate(`/api/v1/record/record?requestId=${encodeURIComponent(requestId)}`);
                }
            },
        },
    );
    return {
        acceptRequest: trigger,
        isMutating,
        error,
        data,
    };
}


type RejectRequestPayload = {
    requestId: string;
    rejectionReason: string;
}
/** Org admin reject — PATCH /api/v1/record/reject?requestId=... */
export function useRejectRequest() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        "/api/v1/record/reject",
        async (url, { arg: { requestId, rejectionReason } }: { arg: RejectRequestPayload }) => {
            const response = await axiosInstance.patch(
                `${url}?requestId=${encodeURIComponent(requestId)}`,
                { rejectionReason },  // destructured from the arg
            );
            return response.data;
        },
        {
            onSuccess: (response) => {
                const requestId = response?.data?.id;

                mutate(
                    (key) =>
                        typeof key === "string" && key.startsWith("/api/v1/record/requests"),
                    undefined,
                    { revalidate: true },
                );
                mutate("/api/v1/organisation/dashboard");  // dashboard card items

                if (requestId) {
                    mutate(`/api/v1/record/record?requestId=${encodeURIComponent(requestId)}`);
                }
            },
        },
    );

    return {
        rejectRequest: trigger,
        isMutating,
        error,
        data,
    };
}


// save student assessment scores (student-view)
export function useSaveStudentScores() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/student-view/save-scores',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: SaveStudentScoresPayload }) => {
            // SWR automatically passes the key as the 'url' parameter
            console.log("arg from useSaveStudentScores", arg);
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // invalidate cache to fetch fresh data for the class record and specific student
            }
        }
    );

    return {
        saveStudentScores: trigger,
        isMutating,
        error,
        data,
    };
}





// save subject assessment scores (subject-view)
export function useSaveSubjectScores() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/subject-view/save-scores',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: SaveSubjectScoresPayload }) => {
            // SWR automatically passes the key as the 'url' parameter
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // invalidate cache to fetch fresh data for the class record and specific subject

            }
        }
    );

    return {
        saveSubjectScores: trigger,
        isMutating,
        error,
        data,
    };
}