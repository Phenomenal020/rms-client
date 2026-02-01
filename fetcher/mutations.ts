// source: https://deepwiki.com/vercel/swr/3.3-useswrmutation
"use client";

import { axiosInstance } from "./fetcher"
import { useSWRConfig } from "swr"
import type { UserData } from "@/types/updateProfile"
import useSWRMutation from "swr/mutation"
import type { UpsertTermPayload } from "@/types/term"
import type { UpsertSchoolPayload, UpsertAssessmentStructurePayload } from "@/types/school"
import type { UpsertSubjectsPayload } from "@/types/subjects"
import type { UpsertStudentsPayload } from "@/types/students"

// update user profile
export function useUpdateProfile() {
    const { mutate } = useSWRConfig();
    
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/users/profile',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: Partial<UserData> }) => {
            // SWR automatically passes the key as the 'url' parameter
            const response = await axiosInstance.patch(url, arg);  // use it to make the api call
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after update
                // Since getUser() uses '/users/session', we invalidate it
                mutate(`/users/session`);
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

// upsert school (create or update)
export function useUpsertSchool() {
    const { mutate } = useSWRConfig();
    
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/school/update',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: UpsertSchoolPayload }) => {  // use form payload type (no id, createdAt, updatedAt, etc) instead of School type (for relations)
            // SWR automatically passes the key as the 'url' parameter. Using POST for upsert (create or update)
            const response = await axiosInstance.post(url, arg);  // use it to make the api call
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after upsert
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                mutate('/users/user');
            }
        }
    );

    return {
        upsertSchool: trigger,
        isMutating,
        error,
        data,
    };
}

// upsert term (create or update)
export function useUpsertTerm() {
    const { mutate } = useSWRConfig();
    
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/term/update',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: UpsertTermPayload }) => {
            // SWR automatically passes the key as the 'url' parameter. Using POST for upsert (create or update)
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after upsert
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                mutate('/users/user');
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
        '/subjects/update',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: UpsertSubjectsPayload }) => {
            // SWR automatically passes the key as the 'url' parameter. Using POST for upsert (create or update)
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after upsert
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                mutate('/users/user');
            }
        }
    );

    // Access axios error message
    // error?.response?.data?.message - server error message
    // error?.message - axios error message
    // error?.response?.data - full error response data
    const errorMessage = error && 'response' in error 
        ? (error as any).response?.data?.message || (error as any).message 
        : (error as any)?.message;

    return {
        upsertSubjects: trigger,
        isMutating,
        error,
        errorMessage,
        data,
    };
}

// upsert assessment structures (create or update) or delete
export function useUpsertAssessmentStructures() {
    const { mutate } = useSWRConfig();
    
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/assessment-structure/update',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: UpsertAssessmentStructurePayload }) => {
            // SWR automatically passes the key as the 'url' parameter. Using POST for upsert (create or update)
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after upsert
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                mutate('/users/user');
            }
        }
    );

    const errorMessage = error && 'response' in error 
        ? (error as any).response?.data?.message || (error as any).message 
        : (error as any)?.message;

    return {
        upsertAssessmentStructures: trigger,
        isMutating,
        error,
        errorMessage,
        data,
    };
}

// upsert students (create or update) or delete
export function useUpsertStudents() {
    const { mutate } = useSWRConfig();
    
    const { trigger, isMutating, error, data } = useSWRMutation(
        '/students/update',  // key - used by SWR for cache identification
        async (url, { arg }: { arg: UpsertStudentsPayload }) => {
            // SWR automatically passes the key as the 'url' parameter. Using POST for upsert (create or update)
            const response = await axiosInstance.post(url, arg);
            return response.data;
        },
        {
            onSuccess: () => {
                // Invalidate cache to refetch fresh user data after upsert
                // Since getUserWithRelations() uses '/users/user', we invalidate it
                mutate('/users/user');
            }
        }
    );

    const errorMessage = error && 'response' in error 
        ? (error as any).response?.data?.message || (error as any).message 
        : (error as any)?.message;

    return {
        upsertStudents: trigger,
        isMutating,
        error,
        errorMessage,
        data,
    };
}