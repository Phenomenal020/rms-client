"use client";

import { SessionManagement } from "./session-management";
import { getCurrentSessionToken, getUserSessions } from "@/fetcher/queries";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/shadcn/ui/skeleton";

// Fetches session data and renders SessionManagement on the dashboard
export function DashboardSessions() {
    const { user } = useUser();
    const enabled = !!user;
    const { sessions, isLoading: sessionsLoading } = getUserSessions(enabled);
    const { token: currentSessionToken, isLoading: tokenLoading } = getCurrentSessionToken(enabled);

    if (!user) return null;

    return (
        <section className="space-y-2 pb-6">

            {sessionsLoading || tokenLoading ? (
                <Skeleton className="h-48 w-full rounded-sm" />
            ) : (
                <SessionManagement sessions={sessions} currentSessionToken={currentSessionToken} />
            )}
        </section>
    );
}
