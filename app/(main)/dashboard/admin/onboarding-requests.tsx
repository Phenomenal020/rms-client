"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";

import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { LoadingButton } from "@/shared-components/loading-button";
import { StatusBadge } from "../helpers/dashboard-badge";
import { DashboardRequestsTableRowsSkeleton } from "../helpers/dashboard-loading";
import { getOnboardingRequests } from "@/fetcher/queries";
import { useUser } from "@/contexts/user-context";
import type { OnboardingRequestRow } from "@/types/onboarding";
import { ViewOnboardingDialog } from "./view-onboarding-dialog";
import { RejectOnboardingDialog } from "./reject-onboarding-dialog";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

// Map api status to local badge
function statusForBadge(status: string) {
    if (status === "APPROVED") return "Accepted";
    if (status === "REJECTED") return "Declined";
    if (status === "PENDING") return "Pending";
    return status;
}

// Concatenate the location fields into a single string
function formatLocation(row: OnboardingRequestRow) {
    return [row.organisationCity, row.organisationState, row.organisationCountry]
        .filter(Boolean)
        .join(", ");
}

export function OnboardingRequests() {
    // Get the user's role and 2fa status from the user context
    const { user } = useUser();
    const canManage = user?.role === "admin" && user.twoFactorEnabled === true;

    // Get all onboarding requests from the api
    const {
        data: onboardingRequests = [],
        error: onboardingRequestsError,
        isLoading: isOnboardingRequestsLoading,
        isValidating: isOnboardingRequestsValidating,
    } = getOnboardingRequests();

    // Initialise search query and status filter
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");

    // State for the current viewing row and open state
    const [viewingRow, setViewingRow] = useState<OnboardingRequestRow | null>(null);
    const [viewOpen, setViewOpen] = useState(false);

    // State for the reject dialog
    const [rejectingRow, setRejectingRow] = useState<OnboardingRequestRow | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);

    // Filter the onboarding requests based on the search query and status filter
    const filteredRequests = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return onboardingRequests?.filter((row) => {
            const matchesStatus = statusFilter === "ALL" || row.status === statusFilter; // default to all
            const matchesSearch =
                !q ||
                row.organisationName.toLowerCase().includes(q) ||
                row.contactEmail.toLowerCase().includes(q) ||
                row.contactPhone.toLowerCase().includes(q) ||
                formatLocation(row).toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [onboardingRequests, searchQuery, statusFilter]);

    // Handle viewing an onboarding request
    function handleView(row: OnboardingRequestRow) {
        setViewingRow(row);
        setViewOpen(true);
    }

    // Open the reject dialog
    function openRejectDialog(row: OnboardingRequestRow) {
        setRejectingRow(row);
        setRejectOpen(true);
    }

    return (
        <>
            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* School onboarding title (number) */}
                            <h4 className="text-base font-semibold text-foreground md:text-lg">
                                School Onboarding ({onboardingRequests?.length ?? 0})
                            </h4>
                            {/* Search and status filter */}
                            <div className="flex items-center gap-2">
                                {/* Search input */}
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search…"
                                    className="h-10 md:h-12 w-1/2 sm:max-w-xs"
                                    disabled={isOnboardingRequestsLoading || onboardingRequests?.length === 0}
                                />
                                {/* Status select filter */}
                                <Select
                                    value={statusFilter}
                                    onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                                    disabled={isOnboardingRequestsLoading || onboardingRequests?.length === 0}
                                >
                                    <SelectTrigger className="h-10 md:h-12 w-36 cursor-pointer">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <hr className="my-3" />

                        <div className="overflow-x-auto py-3">
                            <table className="min-w-[776px] w-full table-fixed border-collapse text-sm  text-left">
                                <colgroup>
                                    <col className="w-[22.5%] md:w-[25%]" />
                                    <col className="w-[22.5%] md:w-[25%]" />
                                    <col className="w-[12.5%]" />
                                    <col className="w-[20%] md:w-[17.5%]" />
                                    <col className="w-[10%] md:w-[20%]" />
                                </colgroup>
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="p-2 font-semibold text-muted-foreground">Organisation</th>
                                        <th className="p-2 font-semibold text-muted-foreground">Location</th>
                                        <th className="p-2 font-semibold text-muted-foreground">Status</th>
                                        <th className="p-2 font-semibold text-muted-foreground">Submitted</th>
                                        <th className="p-2 text-right font-semibold text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* If loading, show the loading skeleton */}
                                    {isOnboardingRequestsLoading || isOnboardingRequestsValidating ? (
                                        <DashboardRequestsTableRowsSkeleton columns={6} rows={3} />
                                    ) : onboardingRequestsError ? (
                                        <tr>
                                            {/* If error, show the error message */}
                                            <td colSpan={6} className="p-4">
                                                <p className="text-center text-destructive">
                                                    Could not load onboarding requests.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : onboardingRequests?.length === 0 ? (
                                        <tr>
                                            {/* If empty, show the empty state */}
                                            <td colSpan={6} className="p-4">
                                                <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                                    <p className="text-base font-medium text-muted-foreground">
                                                        No school onboarding requests yet.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredRequests?.length === 0 ? (
                                        <tr>
                                            {/* If filtered requests return empty, show the empty state */}
                                            <td colSpan={6} className="p-4 text-center text-sm text-muted-foreground">
                                                No requests match your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests?.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                                            >
                                                {/* Organisation name */}
                                                <td className="p-2">
                                                    <span className="block truncate font-medium text-foreground">
                                                        {row.organisationName}
                                                    </span>
                                                </td>
                                                {/* Location */}
                                                <td className="p-2">
                                                    <span className="block truncate text-muted-foreground">
                                                        {formatLocation(row) || "—"}
                                                    </span>
                                                </td>
                                                {/* Status */}
                                                <td className="p-1">
                                                    <StatusBadge status={statusForBadge(row.status)} />
                                                </td>
                                                {/* Submitted date */}
                                                <td className="p-2 tabular-nums text-muted-foreground">
                                                    {new Date(row.createdAt).toLocaleString(undefined, {
                                                        dateStyle: "medium",
                                                        timeStyle: "short",
                                                    })}
                                                </td>
                                                <td className="py-2 px-0">
                                                    {row.status === "PENDING" ? (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <LoadingButton
                                                                type="button"
                                                                size="sm"
                                                                loading={false}
                                                                disabled={!canManage}
                                                                onClick={() => handleView(row)}
                                                                className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                <span>View</span>
                                                            </LoadingButton>
                                                        </div>
                                                    ) : (
                                                        <span className="block text-right text-xs text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </CardContent>
            </Card>

            {/* View onboarding dialog */}
            <ViewOnboardingDialog
                open={viewOpen}
                onOpenChange={(open) => {
                    setViewOpen(open);
                    if (!open) setViewingRow(null);
                }}
                row={viewingRow}
                canManage={canManage}
                onReject={openRejectDialog}
            />

            {/* Reject onboarding dialog */}
            <RejectOnboardingDialog
                open={rejectOpen}
                onOpenChange={(open) => {
                    setRejectOpen(open);
                    if (!open) setRejectingRow(null);
                }}
                row={rejectingRow}
            />
        </>
    );
}
