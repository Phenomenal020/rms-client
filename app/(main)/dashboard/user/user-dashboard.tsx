"use client";

import { StatusBadge } from "../helpers/dashboard-badge";
import { DashboardSessions } from "../helpers/dashboard-sessions";
import { DashboardRequestsTableSkeleton } from "../helpers/dashboard-loading";
import { getTerms } from "@/fetcher/queries";
import type { singleTermPayload } from "@/types/term";
import { Button } from "@/shadcn/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyPending } from "@/shared-components/empty-pending";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { useSWRConfig } from "swr";
// import { recordRequestsKey } from "@/fetcher/keys";
import { getApiErrorMessage } from "@/fetcher/mutations";

// Map record status to badge text
function recordStatusForBadge(status: string) {
    if (status === "ACCEPTED") return "Accepted";
    if (status === "REJECTED") return "Declined";
    if (status === "PENDING") return "Pending";
    return status;
}

export function UserDashboard() {
    // Manually invalidate the record requests cache
    const { mutate } = useSWRConfig();

    // Get the active term
    const { data: termsData = [], isLoading: isTermsLoading } = getTerms();
    const activeTermId =
        (termsData as singleTermPayload[])?.find((t) => t.status === "ACTIVE")?.id ?? null;

    // Use that to get record requests. Teachers receive only their own record requests from this endpoint.
    // const { data: recentRequests, error, isLoading } = getRecentRequests(activeTermId);

    return (
        <Tabs defaultValue="requests" className="pb-6">
            {/* Tabs List */}
            <TabsList variant="line">
                <TabsTrigger value="requests">My Requests</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            {/* Tabs Content */}
            <TabsContent value="requests" className="mt-5">
                {/* If the term is loading, show the skeleton */}
                {isTermsLoading ? (
                    <DashboardRequestsTableSkeleton variant="user" rows={3} />
                ) : !activeTermId ? (
                    <EmptyNoEntry
                        embedded
                        title="No active term"
                        description="Activate an academic term to see your record requests."
                        actionLabel="Set up term"
                        actionHref="/term"
                    />
                ) : (
                    <EmptyPending
                        embedded
                        title="No record requests for this term"
                        description="You have not submitted any record requests for this term."
                    />
                )}
            </TabsContent>

            <TabsContent value="sessions" className="mt-5">
                <DashboardSessions />
            </TabsContent>
        </Tabs>
    );
}