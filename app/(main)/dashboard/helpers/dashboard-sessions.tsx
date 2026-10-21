"use client";

import { SessionManagement } from "./session-management";
import { getCurrentSessionToken, getUserSessions } from "@/fetcher/queries";
import { AUTH_CURRENT_SESSION_KEY, AUTH_SESSIONS_KEY } from "@/fetcher/keys";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { useUser } from "@/contexts/user-context";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { ErrorBanner } from "@/shared-components/error-banner";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSWRConfig } from "swr";

const SESSION_SKELETON_ROWS = 2;
const SESSIONS_LOAD_ERROR = "Failed to load user sessions. Please try again.";

function isAuthRedirectStatus(status: number | undefined): boolean {
    return status === 401 || status === 403;
}

// Brief skeleton matching the sessions card layout
function DashboardSessionsSkeleton() {
    return (
        <Card className="border border-border bg-card shadow-md" aria-busy="true" aria-label="Loading sessions">
            <CardContent className="space-y-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24 md:h-6 md:w-28" />
                        <Skeleton className="h-3.5 w-48" />
                    </div>
                    <Skeleton className="h-8 w-36 shrink-0 rounded-md" />
                </div>

                {/* Session rows */}
                <div className="space-y-3">
                    {Array.from({ length: SESSION_SKELETON_ROWS }).map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 rounded-md border border-border px-3 py-3"
                        >
                            <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <Skeleton className="h-3.5 w-[45%]" />
                                <Skeleton className="h-3 w-[35%]" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Fetches session data and renders SessionManagement on the dashboard
export function DashboardSessions() {
    // Router for handling redirects
    const router = useRouter();
    const pathname = usePathname();
    const { mutate } = useSWRConfig();

    // Get the user and use their data to get their active sessions
    const { user } = useUser();
    const enabled = !!user;
    const { sessions, isLoading: sessionsLoading, error: getUserSessionsError } = getUserSessions(enabled);
    // Get the current session token
    const {
        token: currentSessionToken,
        isLoading: tokenLoading,
        error: getCurrentSessionTokenError,
    } = getCurrentSessionToken(enabled);

    // Get the fetch error and status code. Decide whether to show the error banner (non 401/403 errors)
    const fetchError = getUserSessionsError ?? getCurrentSessionTokenError;
    const fetchErrorStatus = getHttpStatus(fetchError);
    const showErrorBanner = !!fetchError && !isAuthRedirectStatus(fetchErrorStatus) && sessions.length === 0;

    useEffect(() => {
        // If any of the errors are 401/403, handle the redirect accordingly
        for (const err of [getUserSessionsError, getCurrentSessionTokenError]) {
            if (err && handleAuthRedirect(err, { router, pathname })) {
                return;
            }
        }
    }, [getUserSessionsError, getCurrentSessionTokenError, router, pathname]);

    // Retry the session fetches
    function retrySessionFetches() {
        void mutate(AUTH_SESSIONS_KEY);
        void mutate(AUTH_CURRENT_SESSION_KEY);
    }

    // If there is no user, return null
    if (!user) return null;

    // Aggregate loading states
    const isLoading = sessionsLoading || tokenLoading;

    return (
        <section className="space-y-2 pb-6">
            {/* If loading and no error, show the skeleton */}
            {isLoading && !fetchError ? (
                <DashboardSessionsSkeleton />
            ) : showErrorBanner ? (
                <ErrorBanner
                    title="Could not load sessions"
                    message={getApiErrorMessage(fetchError, SESSIONS_LOAD_ERROR)}
                    onRetry={retrySessionFetches}
                />
            ) : fetchError ? (
                null
            ) : (
                <>
                    {/* Todo: Recent Activity section here */}
                    {/* <div>Recent Activity</div> */}
                    <SessionManagement sessions={sessions} currentSessionToken={currentSessionToken} />
                </>
            )}
        </section>
    );
}