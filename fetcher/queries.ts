"use client";

import useSWR from "swr"
import { fetcher } from "@/fetcher/fetcher"
import { authClient } from "@/src/auth-client"
import type { SessionListItem } from "@/src/auth-client"

// get user from session (CLIENT COMPONENT ONLY - uses React hook)
export function getUser() {
    const { data, error, isLoading } = useSWR(`/users/session`, fetcher)  // TODO: Add return type
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

// get user with all relations + infer the type from the fetch function
export function getUserWithRelations() {
    const { data, error, isLoading } = useSWR('/users/user', fetcher);
    return { user: data, error, isLoading };
}
export type UserWithRelations = Awaited<ReturnType<typeof getUserWithRelations>>;