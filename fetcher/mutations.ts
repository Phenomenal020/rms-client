// source: https://deepwiki.com/vercel/swr/3.3-useswrmutation
"use client";
// 
import { axiosInstance } from "@/fetcher/fetcher"
import { useSWRConfig } from "swr"
import useSWRMutation from "swr/mutation"
import type { UserData } from "@/types/updateProfile"
import type { CreateTermPayload, UpdateTermPayload, SaveGradingSystemPayload } from "@/types/term"
import type { createSingleStudent, updateSingleStudent } from "@/types/students"
import type { SaveClassRecordExportPayload, SaveStudentScoresPayload, SaveSubjectScoresPayload } from "@/types/view"
import type { AddMemberPayload } from "@/types/organisation"
import type { createSubjectPayload, updateSubjectPayload } from "@/types/subjects";
import type { createClassPayload, updateClassPayload } from "@/types/classes";
import type { createAssessmentStructurePayload, updateAssessmentStructurePayload } from "@/types/term";
import type { SaveEnrollmentPayload } from "@/types/enrollments";
import type {
    createOnboardingRequestPayload,
    createTeacherJoinRequestPayload,
    AcceptTeacherJoinRequestPayload,
    RejectRequestPayload,
} from "@/types/onboarding";
import {
    // users and organisation keys
    USER_SESSION_KEY,
    USER_PROFILE_KEY,
    USER_WITH_RELATIONS_KEY,
    ORG_MEMBERS_KEY,
    ORGANISATION_ADD_MEMBER_KEY,
    ORGANISATION_DASHBOARD_KEY,
    // terms, grading system, and assessment structure keys
    TERMS_KEY,
    GRADING_SYSTEM_KEY,
    ASSESSMENT_STRUCTURE_KEY,
    gradingSystemByTermPath,  // <-- Requires termId in path
    assessmentStructureByTermPath,  // <-- Requires termId in path
    termByIdPath,  // <-- Requires id in path
    // subjects keys
    SUBJECTS_KEY,
    subjectByIdPath,  // <-- Requires id in path
    // students keys
    STUDENTS_KEY,
    studentByIdPath,  // <-- Requires id in path
    STUDENTS_ENROLLMENT_KEY,
    // classes keys
    CLASSES_KEY,
    classByIdPath,  // <-- Requires id in path
    // student-view / subject-view keys
    STUDENT_VIEW_EXPORT_KEY,
    STUDENT_VIEW_SAVE_SCORES_KEY,
    SUBJECT_VIEW_SAVE_SCORES_KEY,
    CLASS_RECORD_KEY,
    // record requests keys
    RECORD_ACCEPT_KEY,
    RECORD_REJECT_KEY,
    RECORD_REQUESTS_KEY,
    recordByRequestIdKey,  // <-- Requires requestId in query
    recordAcceptPath,  // <-- Requires requestId in query
    recordRejectPath,  // <-- Requires requestId in query
    // onboarding requests keys
    ONBOARDING_REQUESTS_KEY,
    ONBOARDING_CREATE_REQUEST_KEY,
    ONBOARDING_JOIN_REQUEST_KEY,
    ONBOARDING_JOIN_REQUESTS_KEY,
    onboardingRequestApprovePath,  // <-- Requires id in path
    onboardingRequestRejectPath,  // <-- Requires id in path
    teacherJoinRequestApprovePath,  // <-- Requires id in path
    teacherJoinRequestRejectPath,  // <-- Requires id in path
    // prefix matchers
    startsWithKey,
} from "@/fetcher/keys"




// -------------------------------------------- Helper Functions ------------------------------------------
// Shared utility to extract error message from caught errors (axios or api response)
export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred. Please try again."): string {
    const error = err as {
        message?: string; // if from axios
        response?: {
            data?: {
                error?: string | string[]; // if from api response
                message?: string | string[];
            };
        };
    };
    const payload = error?.response?.data;
    const message = payload?.error ?? payload?.message;
    if (Array.isArray(message)) {
        return message.join(", ");
    }
    return message || error?.message || fallback;
}

// get the http status code from the error
export function getHttpStatus(err: unknown): number | undefined {
    const status = (err as { status?: number })?.status
      ?? (err as { response?: { status?: number } })?.response?.status;
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




// -------------------------- Users and Organisation --------------------------
// update user profile — PATCH /api/v1/users/profile
export function useUpdateProfile() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        USER_PROFILE_KEY,
        async (url, { arg }: { arg: Partial<UserData> }) => {
            const response = await axiosInstance.patch(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate so getUser() and getUserWithRelations() refetch fresh identity data
                mutate(USER_SESSION_KEY);
                mutate(USER_WITH_RELATIONS_KEY);
            },
        },
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
        ORGANISATION_ADD_MEMBER_KEY,
        async (url, { arg }: { arg: AddMemberPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(ORG_MEMBERS_KEY);  // invalidate the org members key to refetch the org members
            },
        },
    );
    return {
        addMemberClient: trigger,
        isMutating,
        error,
        data,
    };
}




// ---------------------------- Onboarding Requests -----------------------------------
// create onboarding request — POST /api/v1/onboarding/create-request
export function useCreateOnboardingRequest() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        ONBOARDING_CREATE_REQUEST_KEY,
        async (url, { arg }: { arg: createOnboardingRequestPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Revalidates this browser's SWR cache for the platform-admin list only.
                // Does NOT push live updates to other platform-admin clients — SWR is per-tab/browser,
                // not cross-user realtime. Harmless no-op if this client never fetched that key.
                mutate(ONBOARDING_REQUESTS_KEY);
                mutate(USER_WITH_RELATIONS_KEY);
            },
        },
    );
    return {
        createOnboardingRequest: trigger,
        isMutating,
        error,
        data,
    };
}

// create teacher join request — POST /api/v1/onboarding/join-request
export function useCreateTeacherJoinRequest() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        ONBOARDING_JOIN_REQUEST_KEY,
        async (url, { arg }: { arg: createTeacherJoinRequestPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Revalidates this browser's SWR cache for the org-admin join-request list only.
                // Does NOT push live updates to other org-admin clients — SWR is per-tab/browser.
                mutate(ONBOARDING_JOIN_REQUESTS_KEY);
                mutate(USER_WITH_RELATIONS_KEY);
            },
        },
    );
    return {
        createTeacherJoinRequest: trigger,
        isMutating,
        error,
        data,
    };
}

// Approve onboarding request — PUT /api/v1/onboarding/requests/:id/approve (platform admin)
export function useApproveOnboardingRequest() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        `${ONBOARDING_REQUESTS_KEY}/approve`,
        async (_url, { arg }: { arg: { id: string } }) => {
            const response = await axiosInstance.put(onboardingRequestApprovePath(arg.id));
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(ONBOARDING_REQUESTS_KEY);
            },
        },
    );
    return {
        approveOnboardingRequest: trigger,
        isMutating,
        error,
        data,
    };
}

// Reject onboarding request — PUT /api/v1/onboarding/requests/:id/reject (platform admin)
export function useRejectOnboardingRequest() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        `${ONBOARDING_REQUESTS_KEY}/reject`,
        async (_url, { arg }: { arg: { id: string } & RejectRequestPayload }) => {
            const { id, ...body } = arg;
            const response = await axiosInstance.put(onboardingRequestRejectPath(id), body);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(ONBOARDING_REQUESTS_KEY);
            },
        },
    );
    return {
        rejectOnboardingRequest: trigger,
        isMutating,
        error,
        data,
    };
}

// Finalize teacher join approval — PUT /api/v1/onboarding/join-requests/:id/approve
// Server owns add-member; client only calls this endpoint
export function useApproveTeacherJoinRequest() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        `${ONBOARDING_JOIN_REQUESTS_KEY}/approve`,
        async (_url, { arg }: { arg: { id: string } }) => {
            const response = await axiosInstance.put(teacherJoinRequestApprovePath(arg.id));
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(ONBOARDING_JOIN_REQUESTS_KEY);
                mutate(ORG_MEMBERS_KEY);
            },
        },
    );
    return {
        approveTeacherJoinRequest: trigger,
        isMutating,
        error,
        data,
    };
}

// Reject teacher join request — PUT /api/v1/onboarding/join-requests/:id/reject
export function useRejectTeacherJoinRequest() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        `${ONBOARDING_JOIN_REQUESTS_KEY}/reject`,
        async (_url, { arg }: { arg: { id: string } & RejectRequestPayload }) => {
            const { id, ...body } = arg;
            const response = await axiosInstance.put(teacherJoinRequestRejectPath(id), body);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(ONBOARDING_JOIN_REQUESTS_KEY);
            },
        },
    );
    return {
        rejectTeacherJoinRequest: trigger,
        isMutating,
        error,
        data,
    };
}

// Accept teacher join request — server adds the member and finalises status in one approve call
export function useAcceptTeacherJoinRequest() {
    const { approveTeacherJoinRequest, isMutating } = useApproveTeacherJoinRequest();

    async function acceptTeacherJoinRequest(arg: AcceptTeacherJoinRequestPayload) {
        // Server owns membership: approve adds the member via BA, then marks request + user APPROVED
        await approveTeacherJoinRequest({ id: arg.requestId });
    }

    return {
        acceptTeacherJoinRequest,
        isMutating,
    };
}




// ---------------------------- Terms, Grading System, and Assessment Structure -----------------------------------
// create term — POST /api/v1/terms
export function useCreateTerm() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        TERMS_KEY,
        async (url, { arg }: { arg: CreateTermPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate so getTerms() refetches and all three cards see the new term.
                mutate(TERMS_KEY);
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

// update term — PATCH /api/v1/terms/:id
export function useUpdateTerm() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        TERMS_KEY,
        async (_url, { arg }: { arg: UpdateTermPayload }) => {
            const { id, ...body } = arg;
            if (!id) throw new Error("Term id is required to update a term");
            const response = await axiosInstance.patch(termByIdPath(id), body);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate so getTerms() refetches the updated dates/days.
                mutate(TERMS_KEY);
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

// Save grading system for a term — POST /api/v1/grading-system/:termId (full replace)
export function useSaveGradingSystem() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        GRADING_SYSTEM_KEY,
        async (_url, { arg }: { arg: SaveGradingSystemPayload }) => {
            const { termId, ...body } = arg;
            const response = await axiosInstance.post(gradingSystemByTermPath(termId), body);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(startsWithKey(GRADING_SYSTEM_KEY));
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

// Create assessment structure for a term — POST /api/v1/assessment-structure
export function useCreateAssessmentStructure() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        ASSESSMENT_STRUCTURE_KEY,
        async (url, { arg }: { arg: createAssessmentStructurePayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(startsWithKey(ASSESSMENT_STRUCTURE_KEY));
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

// Update assessment structure for a term — PATCH /api/v1/assessment-structure/:termId
export function useUpdateAssessmentStructure() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        ASSESSMENT_STRUCTURE_KEY,
        async (_url, { arg }: { arg: updateAssessmentStructurePayload }) => {
            const { termId, ...body } = arg;
            const response = await axiosInstance.patch(assessmentStructureByTermPath(termId), body);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(startsWithKey(ASSESSMENT_STRUCTURE_KEY));
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




// ---------------------------- Subjects -----------------------------------
// create a subject — POST /api/v1/subjects
export function useCreateSubject() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        SUBJECTS_KEY,
        async (url, { arg }: { arg: createSubjectPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(SUBJECTS_KEY);
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

// update a subject — PATCH /api/v1/subjects/:id
export function useUpdateSubject() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        SUBJECTS_KEY,
        async (_url, { arg }: { arg: updateSubjectPayload }) => {
            const { id, ...body } = arg;
            const response = await axiosInstance.patch(subjectByIdPath(id), body);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(SUBJECTS_KEY);
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




// ---------------------------- Classes -----------------------------------
// create a class — POST /api/v1/classes
export function useCreateClass() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        CLASSES_KEY,
        async (url, { arg }: { arg: createClassPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // revalidate all class keys (with and without ?termId=)
                mutate(startsWithKey(CLASSES_KEY), undefined, { revalidate: true });
            },
        },
    );
    return { trigger, isMutating, error, data };
}

// update a class — PATCH /api/v1/classes/:id
export function useUpdateClass() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        CLASSES_KEY,
        async (_url, { arg }: { arg: { id: string } & updateClassPayload }) => {
            const { id, ...body } = arg;
            const response = await axiosInstance.patch(classByIdPath(id), body);
            return response.data;
        },
        {
            onSuccess: () => {
                // revalidate all class keys (with and without ?termId=)
                mutate(startsWithKey(CLASSES_KEY), undefined, { revalidate: true });
            },
        },
    );
    return { trigger, isMutating, error, data };
}




// ---------------------------- Students -----------------------------------
// create a student — POST /api/v1/students
export function useCreateStudent() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        STUDENTS_KEY,
        async (url, { arg }: { arg: createSingleStudent }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(STUDENTS_KEY);
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

// update a student — PATCH /api/v1/students/:id
export function useUpdateStudent() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        STUDENTS_KEY,
        async (_url, { arg }: { arg: updateSingleStudent }) => {
            const { id, ...body } = arg;
            const response = await axiosInstance.patch(studentByIdPath(id), body);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(STUDENTS_KEY);
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




// ---------------------------- Enrollments -----------------------------------
// save a student's subject enrollments — POST /api/v1/students/enrollment
export function useSaveEnrollment() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        STUDENTS_ENROLLMENT_KEY,
        async (url, { arg }: { arg: SaveEnrollmentPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Enrollment GET keys are /students/enrollments?... — prefix-match the list
                mutate(startsWithKey(`${STUDENTS_KEY}/enrollments`));
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




// ---------------------------- Class Record / Scores -----------------------------------
// Submit class record snapshot for export / admin approval — POST /api/v1/student-view/export
export function useSaveRecord() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        STUDENT_VIEW_EXPORT_KEY,
        async (url, { arg }: { arg: SaveClassRecordExportPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate(startsWithKey(RECORD_REQUESTS_KEY));
                mutate(ORGANISATION_DASHBOARD_KEY);
            },
        },
    );
    return {
        saveRecord: trigger,
        isMutating,
        error,
        data,
    };
}

// save student assessment scores — POST /api/v1/student-view/save-scores
export function useSaveStudentScores() {
    const { trigger, isMutating, error, data } = useSWRMutation(
        STUDENT_VIEW_SAVE_SCORES_KEY,
        async (url, { arg }: { arg: SaveStudentScoresPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
    );
    return {
        saveStudentScores: trigger,
        isMutating,
        error,
        data,
    };  // refetch manually triggered in ResultsComponent.tsx
}

// save subject assessment scores — POST /api/v1/subject-view/save-scores
export function useSaveSubjectScores() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        SUBJECT_VIEW_SAVE_SCORES_KEY,
        async (url, { arg }: { arg: SaveSubjectScoresPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // invalidate class-record cache so subject/student views see fresh scores
                mutate(startsWithKey(CLASS_RECORD_KEY));
            },
        },
    );
    return {
        saveSubjectScores: trigger,
        isMutating,
        error,
        data,
    };
}




// ---------------------------- Record Requests -----------------------------------
type RejectRecordPayload = {
    requestId: string;
    rejectionReason: string;
};

// Org admin accept — PATCH /api/v1/record/accept?requestId=...
export function useAcceptRequest() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        RECORD_ACCEPT_KEY,
        async (_url, { arg: requestId }: { arg: string }) => {
            const response = await axiosInstance.patch(recordAcceptPath(requestId));
            return response.data;
        },
        {
            onSuccess: (response) => {
                const requestId = response?.data?.id;
                mutate(startsWithKey(RECORD_REQUESTS_KEY), undefined, { revalidate: true });
                mutate(ORGANISATION_DASHBOARD_KEY);
                if (requestId) {
                    mutate(recordByRequestIdKey(requestId));
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

// Org admin reject — PATCH /api/v1/record/reject?requestId=...
export function useRejectRequest() {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error, data } = useSWRMutation(
        RECORD_REJECT_KEY,
        async (_url, { arg: { requestId, rejectionReason } }: { arg: RejectRecordPayload }) => {
            const response = await axiosInstance.patch(
                recordRejectPath(requestId),
                { rejectionReason },
            );
            return response.data;
        },
        {
            onSuccess: (response) => {
                const requestId = response?.data?.id;
                mutate(startsWithKey(RECORD_REQUESTS_KEY), undefined, { revalidate: true });
                mutate(ORGANISATION_DASHBOARD_KEY);
                if (requestId) {
                    mutate(recordByRequestIdKey(requestId));
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
