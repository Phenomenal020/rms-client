"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { LoadingButton } from "@/shared-components/loading-button";
import { StatusBadge } from "../helpers/dashboard-badge";
import { DashboardRequestsTableRowsSkeleton } from "../helpers/dashboard-loading";
import { getRecentRequests, getTerms, type PendingRecordRequestRow } from "@/fetcher/queries";
import { getApiErrorMessage, useAcceptRequest, useRejectRequest } from "@/fetcher/mutations";
import { useUser } from "@/contexts/user-context";
import type { singleTermPayload } from "@/types/term";

// Default decline reason for record requests
const DEFAULT_DECLINE_REASON = "Declined by organisation admin.";

// Map api statuses to badge statuses
function statusForBadge(status: string) {
    if (status === "ACCEPTED" || status === "APPROVED") return "Accepted";
    if (status === "REJECTED") return "Declined";
    if (status === "PENDING") return "Pending";
    return status;
}

export function RecordRequests({ title = "Record Requests" }: { title?: string }) {
    // Check the user is an org admin and has two-factor enabled
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && user.twoFactorEnabled === true;

    // Resolve the active academic term (record requests are scoped to the current term)
    const { data: termsData } = getTerms(true);
    const activeTermId =
        (termsData as singleTermPayload[] | null)?.find((t) => t.status === "ACTIVE")?.id ?? null;
    // Fetch pending record requests for the active term
    const {
        data: recentRequests = [],
        error: recordRequestsError,
        isLoading: isRecordRequestsLoading,
        isValidating: isRecordRequestsValidating,
    } = getRecentRequests(activeTermId);

    // Search query for the table
    const [searchQuery, setSearchQuery] = useState("");

    // Action ID for the table
    const [actionId, setActionId] = useState<string | null>(null);

    // Mutations for accepting and rejecting record requests
    const { acceptRequest, isMutating: isAccepting } = useAcceptRequest();
    const { rejectRequest, isMutating: isRejecting } = useRejectRequest();
    const busy = isAccepting || isRejecting;

    // Filtered requests for the table
    const filteredRequests = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return (recentRequests ?? []).filter((row) => {
            if (!q) return true;  // if q is empty, return all rows
            return (
                row.formTeacherName.toLowerCase().includes(q) ||
                row.className.toLowerCase().includes(q)
            );
        });
    }, [recentRequests, searchQuery]);

    // Handle accepting a record request
    async function handleAccept(row: PendingRecordRequestRow) {
        setActionId(row.id);  // this request is now being processed (for the spinner)
        try {
            await acceptRequest(row.id);
            toast.success(`Accepted record request for ${row.className}.`);
        } catch (err) {   // Catch any mutation error (http, network, axios, etc.)
            toast.error(getApiErrorMessage(err, "Failed to accept record request."));
        } finally {
            setActionId(null);  // reset the action ID (disables the spinner)
        }
    }

    // Handle declining a record request
    async function handleDecline(row: PendingRecordRequestRow) {
        setActionId(row.id);
        try {
            await rejectRequest({
                requestId: row.id,
                rejectionReason: DEFAULT_DECLINE_REASON,  // for now. Later, add the rejection reason input
            });
            toast.success(`Declined record request for ${row.className}.`);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to decline record request."));
        } finally {
            setActionId(null);
        }
    }

    return (
        <Card className="border shadow-md">
            <CardContent>
                <section className="overflow-hidden rounded-sm bg-card">
                    {/* Record Requests title and search input */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <h4 className="text-base font-semibold text-foreground md:text-lg">
                                {title} ({recentRequests?.length ?? 0})
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Result approval requests for the current term.
                            </p>
                        </div>
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search…"
                            className="h-10 md:h-12 w-full sm:max-w-xs"
                            disabled={!activeTermId || isRecordRequestsLoading || (recentRequests?.length ?? 0) === 0}
                        />
                    </div>
                    <hr className="my-3" />

                    <div className="overflow-x-auto py-3">
                        <table className="min-w-[640px] w-full table-fixed border-collapse text-sm text-left">
                            {/* Table column widths */}
                            <colgroup>
                                <col className="w-[27.5%]" />
                                <col className="w-[27.5%]" />
                                <col className="w-[12.5%]" />
                                <col className="w-[17.5%]" />
                                <col className="w-[15%]" />
                            </colgroup>
                            {/* Table headers */}
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="p-2 font-semibold text-muted-foreground">Teacher</th>
                                    <th className="p-2 font-semibold text-muted-foreground">Class</th>
                                    <th className="p-2 font-semibold text-muted-foreground">Status</th>
                                    <th className="p-2 font-semibold text-muted-foreground">Submitted</th>
                                    <th className="p-2 text-right font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            {/* Table rows */}
                            <tbody>
                                {!activeTermId ? (
                                    // No active term — record requests cannot be loaded
                                    <tr>
                                        <td colSpan={5} className="p-4">
                                            <p className="text-center text-sm text-muted-foreground">
                                                Activate an academic term to see pending record requests.
                                            </p>
                                        </td>
                                    </tr>
                                ) : isRecordRequestsLoading || isRecordRequestsValidating ? (
                                    // If the request is loading or validating, show the loading skeleton (5 columns, 3 rows)
                                    <DashboardRequestsTableRowsSkeleton columns={5} rows={3} />
                                ) : recordRequestsError ? (
                                    // If there is an error fetching the requests, show the error component (TODO: Display the shared one)
                                    <tr>
                                        <td colSpan={5} className="p-4">
                                            <p className="text-center text-destructive">
                                                Could not load record requests.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (recentRequests?.length ?? 0) === 0 ? (
                                    // If there are no pending requests, show the empty state (TODO: Display the shared one)
                                    <tr>
                                        <td colSpan={5} className="p-4">
                                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    No pending record requests for this term.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    // If the filter returns an empty array, show the no requests match your search message
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-sm text-muted-foreground">
                                            No requests match your search.
                                        </td>
                                    </tr>
                                ) : (
                                    // Finally, if there are requests, show them in the table (TODO: Display the shared one)
                                    filteredRequests.map((row) => {
                                        const isRowBusy = busy && actionId === row.id;  // true iff this row is being modified (to display the spinner on the correct row)
                                        return (
                                            <tr
                                                key={row.id}
                                                className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                                            >
                                                {/* Teacher column */}
                                                <td className="p-2">
                                                    <span className="block truncate font-medium text-foreground">
                                                        {row.formTeacherName.trim() || "—"}
                                                    </span>
                                                </td>
                                                {/* Class column */}
                                                <td className="p-2">
                                                    <span className="block truncate text-muted-foreground">
                                                        {row.className || "—"}
                                                    </span>
                                                </td>
                                                {/* Status column */}
                                                <td className="p-1">
                                                    <StatusBadge status={statusForBadge(row.status)} />
                                                </td>
                                                {/* Submitted column */}
                                                <td className="p-2 tabular-nums text-muted-foreground">
                                                    {new Date(row.createdAt).toLocaleString(undefined, {
                                                        dateStyle: "medium",
                                                        timeStyle: "short",
                                                    })}
                                                </td>
                                                {/* Actions column */}
                                                <td className="py-2 px-0">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Accept button */}
                                                        <LoadingButton
                                                            type="button"
                                                            size="sm"
                                                            loading={isRowBusy && isAccepting}
                                                            disabled={!canManage || busy}
                                                            onClick={() => handleAccept(row)}
                                                            className="cursor-pointer border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            <span className="hidden sm:inline">Accept</span>
                                                        </LoadingButton>
                                                        {/* Decline button */}
                                                        <LoadingButton
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            loading={isRowBusy && isRejecting}
                                                            disabled={!canManage || busy}
                                                            onClick={() => handleDecline(row)}
                                                            className="cursor-pointer border border-rose-500/25 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-300"
                                                        >
                                                            <X className="h-3 w-3" />
                                                            <span className="hidden sm:inline">Decline</span>
                                                        </LoadingButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </CardContent>
        </Card>
    );
}
