"use client";

import { StatusBadge } from "./dashboard-badge";
import { getRecentRequests, getTerms } from "@/fetcher/queries";
import type { singleTermPayload } from "@/types/term";
import { Button } from "@/shadcn/ui/button";

function recordStatusForBadge(status: string) {
    if (status === "ACCEPTED") return "Accepted";
    if (status === "REJECTED") return "Declined";
    if (status === "PENDING") return "Pending";
    return status;
}

export function UserDashboard() {
    // Get the active term
    const { data: termsData = [] } = getTerms();
    const activeTermId =
        (termsData as singleTermPayload[])?.find((t) => t.status === "ACTIVE")?.id ?? null;

    // Regular users receive only their own record requests from this endpoint.
    const { data: recentRequests, error, isLoading, isValidating } = getRecentRequests(activeTermId);

    console.log("recentRequests", recentRequests);

    return (
        <section className="space-y-2 pb-6">
            <h4 className="text-xl font-semibold tracking-tight text-foreground">
                My Requests
            </h4>

            <div className="overflow-x-auto rounded-sm border border-border bg-card shadow-md">
                <table className="min-w-[440px] w-full table-fixed border-collapse text-sm md:text-base">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="w-[25%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
                                Class
                            </th>
                            <th className="w-[20%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
                                Status
                            </th>
                            <th className="w-[40%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
                                Date &amp; Time
                            </th>
                            <th className="w-[15%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {!activeTermId ? (
                            <tr>
                                <td colSpan={4} className="p-4">
                                    <p className="text-center text-muted-foreground">
                                        Activate an academic term to see your record requests.
                                    </p>
                                </td>
                            </tr>
                        ) : isLoading || isValidating ? (
                            <tr>
                                <td colSpan={4} className="p-4">
                                    <p className="text-center text-muted-foreground">Loading requests...</p>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={4} className="p-4">
                                    <p className="text-center text-destructive">Could not load requests.</p>
                                </td>
                            </tr>
                        ) : recentRequests.length > 0 ? (
                            recentRequests.map((row) => (
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
                                                // variant="destructive"
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
                                                className="border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 cursor-pointer"
                                            >
                                                Review
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-4">
                                    <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                        <p className="text-base font-medium text-muted-foreground">
                                            You have not submitted any record requests for this term.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
