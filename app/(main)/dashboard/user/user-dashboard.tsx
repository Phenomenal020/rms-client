"use client";

import { StatusBadge } from "../helpers/dashboard-badge";
import { DashboardSessions } from "../helpers/dashboard-sessions";
import { DashboardRequestsTableSkeleton } from "../helpers/dashboard-loading";
import { getRecentRequests, getTerms } from "@/fetcher/queries";
import type { singleTermPayload } from "@/types/term";
import { Button } from "@/shadcn/ui/button";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyPending } from "@/shared-components/empty-pending";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { useSWRConfig } from "swr";
import { recordRequestsKey } from "@/fetcher/keys";
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
    const { data: recentRequests, error, isLoading } = getRecentRequests(activeTermId);

    return (
        <section className="space-y-10 pb-6">
            {/* My Requests title */}
            <h4 className="text-xl font-semibold tracking-tight text-foreground">
                My Requests
            </h4>

            {/* If there is no active term, show the empty component */}
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
            ) : isLoading && (recentRequests?.length ?? 0) === 0 ? (
                <DashboardRequestsTableSkeleton variant="user" rows={3} />
            ) : error ? (
                // If there is an error loading the record requests, show the error banner
                <ErrorBanner
                    title="Could not load requests"
                    message={getApiErrorMessage(error, "Failed to load your record requests. Please try again.")}
                    onRetry={() => {
                        if (activeTermId) {
                            void mutate(recordRequestsKey(activeTermId));
                        }
                    }}
                />
            ) : recentRequests && recentRequests.length > 0 ? (
                // If there are record requests, show them in the table (TODO: Display the shared one)
                <div className="overflow-x-auto rounded-sm border border-border bg-card shadow-md">
                    <table className="min-w-[440px] w-full table-fixed border-collapse text-sm md:text-base">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="w-[25%] p-3 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground md:text-base">
                                    Class
                                </th>
                                <th className="w-[20%] p-3 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground md:text-base">
                                    Status
                                </th>
                                <th className="w-[40%] p-3 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground md:text-base">
                                    Date &amp; Time
                                </th>
                                <th className="w-[15%] p-3 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground md:text-base">
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRequests.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/40"
                                >
                                    <td className="p-3 text-foreground">
                                        {row.className}
                                    </td>
                                    <td className="p-1">
                                        <StatusBadge status={recordStatusForBadge(row.status)} />
                                    </td>
                                    <td className="p-3 tabular-nums text-muted-foreground">
                                        {new Date(row.createdAt).toLocaleString(undefined, {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </td>
                                    <td className="p-1">
                                        {row.status === "PENDING" ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="cursor-pointer"
                                            >
                                                Cancel
                                            </Button>
                                        ) : row.status === "ACCEPTED" ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled
                                                className="bg-emerald-600 text-white"
                                            >
                                                Review
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="cursor-pointer border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                            >
                                                Review
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // If there are no record requests for the active term, show the empty pending component
                <EmptyPending
                    embedded
                    title="No record requests for this term"
                    description="You have not submitted any record requests for this term."
                />
            )}

            <DashboardSessions />
        </section>
    );
}
