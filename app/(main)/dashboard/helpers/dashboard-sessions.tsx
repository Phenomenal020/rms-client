"use client";

import { SessionManagement } from "./session-management";
import { getCurrentSessionToken, getUserSessions } from "@/fetcher/queries";
import { useUser } from "@/contexts/user-context";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Skeleton } from "@/shadcn/ui/skeleton";

const SESSION_SKELETON_ROWS = 2;

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
    const { user } = useUser();
    const enabled = !!user;
    const { sessions, isLoading: sessionsLoading } = getUserSessions(enabled);
    const { token: currentSessionToken, isLoading: tokenLoading } = getCurrentSessionToken(enabled);

    if (!user) return null;
    return (
        <section className="space-y-2 pb-6">
            {sessionsLoading || tokenLoading ? (
                <DashboardSessionsSkeleton />
            ) : (
                <SessionManagement sessions={sessions} currentSessionToken={currentSessionToken} />
            )}
        </section>
    );
}