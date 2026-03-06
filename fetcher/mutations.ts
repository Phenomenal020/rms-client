// source: https://deepwiki.com/vercel/swr/3.3-useswrmutation
"use client";

import { axiosInstance } from "./fetcher"
import { useSWRConfig } from "swr"
import type { UserData } from "@/types/updateProfile"
import useSWRMutation from "swr/mutation"
import type { UpsertTermPayload } from "@/types/term"
import type { UpsertSchoolPayload, CreateSchoolResponse, UpsertAssessmentStructurePayload } from "@/types/school"
import type { UpsertSubjectsPayload } from "@/types/subjects"
import type { UpsertStudentsPayload } from "@/types/students"
import type { SaveStudentScoresPayload, SaveSubjectScoresPayload } from "@/types/view"

// Shared utility to extract error message from caught errors (axios or generic)
export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred. Please try again."): string {
    const error = err as any;
    return error?.response?.data?.message || error?.message || fallback;
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

// create school (first time setup)
export function useCreateSchool() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/school',
        async (url, { arg }: { arg: UpsertSchoolPayload }) => {
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate('/api/v1/users/user');
            }
        }
    );

    return {
        createSchool: trigger,
        isMutating,
        error,
        data,
    };
}

// update school (existing school)
export function useUpdateSchool() {
    const { mutate } = useSWRConfig();

    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/school',
        async (url, { arg }: { arg: UpsertSchoolPayload }) => {
            const response = await axiosInstance.patch(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                mutate('/api/v1/users/user');
            }
        }
    );

    return {
        updateSchool: trigger,
        isMutating,
        error,
        data,
    };
}

// upsert term (create or update)
export function useUpsertTerm() {
    const { mutate } = useSWRConfig();
    
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/term/update',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: UpsertTermPayload }) => {
            // SWR automatically passes the key as the 'url' parameter. Using POST for upsert (create or update)
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after upsert
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                mutate('/api/v1/users/user');  // for views to get fresh term data
            }
        }
    );

    return {
        upsertTerm: trigger,
        isMutating,
        error,
        data,
    };
}

// upsert subjects (create or update) or delete
export function useUpsertSubjects() {
    const { mutate } = useSWRConfig();
    
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/subjects/update',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: UpsertSubjectsPayload }) => {
            // SWR automatically passes the key as the 'url' parameter. Using POST for upsert (create or update)
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after upsert
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                mutate('/api/v1/users/user');  // for views to get fresh subject data
            }
        }
    );

    return {
        upsertSubjects: trigger,
        isMutating,
        error,
        data,
    };
}

// upsert assessment structures (create or update) or delete
export function useUpsertAssessmentStructures() {
    const { mutate } = useSWRConfig();
    
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/assessment-structure/update',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: UpsertAssessmentStructurePayload }) => {
            // SWR automatically passes the key as the 'url' parameter. Using POST for upsert (create or update)
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after upsert
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                mutate('/api/v1/users/user');  // for views to get fresh assessment structure data
            }
        }
    );

    return {
        upsertAssessmentStructures: trigger,
        isMutating,
        error,
        data,
    };
}

// upsert students (create or update) or delete
export function useUpsertStudents() {
    const { mutate } = useSWRConfig();
    
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/api/v1/students/update',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: UpsertStudentsPayload }) => {
            // SWR automatically passes the key as the 'url' parameter. Using POST for upsert (create or update)
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after upsert
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                // mutate('/users/user');
                mutate('/api/v1/users/user');  // for views to get fresh student data
            }
        }
    );

    return {
        upsertStudents: trigger,
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
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after saving scores
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                // mutate('/users/user');
                // do nothing
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
                // Invalidate cache to refetch fresh user data after saving scores
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                // mutate('/users/user');
                // do nothing
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