import { Button } from "@/shadcn/ui/button";
import { StatusBadge } from "./dashboard-badge";
import { getRecentRequests, getTerms } from "@/fetcher/queries";
import type { singleTermPayload } from "@/types/term";
import Link from "next/link";

function recordStatusForBadge(status: string) {
    if (status === "ACCEPTED") return "Accepted";
    if (status === "REJECTED") return "Declined";
    if (status === "PENDING") return "Pending";
    return status;
}

export function OrgDashboard() {
    // Get the active term
    const { data: termsData = [] } = getTerms();
    const activeTermId =
        (termsData as singleTermPayload[])?.find((t) => t.status === "ACTIVE")?.id ?? null;

    // Use it to get the recent requests
    const { data: recentRequests, error, isLoading, isValidating } = getRecentRequests(activeTermId);

    return (
        <section className="space-y-2 pb-6">

            {/* Recent requests header */}
            <h4 className="text-xl font-semibold tracking-tight text-foreground">
                Pending Requests
            </h4>

            <div className="overflow-x-auto rounded-sm border border-border bg-card shadow-md">
                <table className="min-w-[480px] w-full table-fixed border-collapse text-sm md:text-base">
                    <thead>
                        {/* Table header row */}
                        <tr className="border-b border-border bg-muted/50">
                            <th className="w-[35%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
                                Teacher
                            </th>
                            <th className="w-[17.5%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
                                Class
                            </th>
                            <th className="w-[17.5%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
                                Status
                            </th>
                            <th className="w-[22.5%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
                                Date &amp; Time
                            </th>
                            <th className="w-[7.5%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground" aria-hidden />
                        </tr>
                    </thead>

                    {/* Table body (maps through the recent upload requests) */}
                    <tbody>
                        {!activeTermId ? (
                            <tr>
                                <td colSpan={5} className="p-4">
                                    <p className="text-center text-muted-foreground">
                                        Activate an academic term to see pending record requests.
                                    </p>
                                </td>
                            </tr>
                        ) : isLoading || isValidating ? (
                            <tr>
                                <td colSpan={5} className="p-4">
                                    <p className="text-center text-muted-foreground">Loading requests…</p>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="p-4">
                                    <p className="text-center text-destructive">Could not load requests.</p>
                                </td>
                            </tr>
                        ) : recentRequests.length > 0 ? (
                            recentRequests.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/40"
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">
                                                {row.formTeacherName.trim()}
                                            </span>
                                        </div>
                                    </td>
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
                                        <Link href={`/dashboard/review/${row.id}`}
                                            className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300"
                                            aria-label="Review request"
                                        >
                                            <span className="hidden sm:inline">Review</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-4">
                                    <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                        <p className="text-base font-medium text-muted-foreground">
                                            No pending record requests for this term.
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
