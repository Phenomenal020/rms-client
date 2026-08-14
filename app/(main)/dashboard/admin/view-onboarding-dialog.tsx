"use client";

import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { LoadingButton } from "@/shared-components/loading-button";
import { StatusBadge } from "../helpers/dashboard-badge";
import { getApiErrorMessage, useApproveOnboardingRequest } from "@/fetcher/mutations";
import type { OnboardingRequestRow } from "@/types/onboarding";

// Props for the view onboarding dialog
type ViewOnboardingDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    row: OnboardingRequestRow | null;
    canManage: boolean;
    onReject: (row: OnboardingRequestRow) => void;
};

// Function to get the status badge for the onboarding request
function statusForBadge(status: string) {
    if (status === "APPROVED") return "Accepted";
    if (status === "REJECTED") return "Declined";
    if (status === "PENDING") return "Pending";
    return status;
}

export function ViewOnboardingDialog({open, onOpenChange, row, canManage, onReject}: ViewOnboardingDialogProps) {
    // Mutation for approving an onboarding request
    const { approveOnboardingRequest, isMutating: isApproving } = useApproveOnboardingRequest();

    // Handle approving an onboarding request
    async function handleApprove() {
        if (!row) return; // If no row, return
        try {  // Otherwise, approve the onboarding request
            await approveOnboardingRequest({ id: row.id }); // toast success and reset dialog state
            toast.success(`Approved "${row.organisationName}".`);
            onOpenChange(false);
        } catch (err) { // If error, toast error and do not reset dialog state
            toast.error(getApiErrorMessage(err, "Failed to approve request. Please try again."));
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                {/* View Onboarding Request Title */}
                <DialogHeader>
                    <DialogTitle className="text-left">View onboarding request</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>
                {row && (
                    <div className="space-y-4">
                        {/* Organisation name and status */}
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-base font-semibold text-foreground">{row.organisationName}</p>
                            <StatusBadge status={statusForBadge(row.status)} />
                        </div>

                        <dl className="space-y-4 border-t py-2">
                            <div className="space-y-1 border-b py-2">
                                {/* Address label */}
                                <dt className="text-xs font-semibold tracking-wide text-muted-foreground">
                                    Address
                                </dt>
                                {/* Address details */}
                                <dd className="text-sm text-foreground">
                                    {[
                                        row.organisationAddressLine1,
                                        row.organisationCity,
                                        row.organisationState,
                                        row.organisationPostalCode,
                                        row.organisationCountry,
                                    ]
                                        .filter(Boolean)
                                        .join(", ") || "—"}
                                </dd>
                            </div>
                            {/* Contact email */}
                            <div className="space-y-1 border-b py-2">
                                <dt className="text-xs font-semibold tracking-wide text-muted-foreground">
                                    Contact Email
                                </dt>
                                <dd className="break-all text-sm text-foreground">{row.contactEmail || "—"}</dd>
                            </div>
                            {/* Contact phone */}
                            <div className="space-y-1 border-b py-2">
                                <dt className="text-xs font-semibold tracking-wide text-muted-foreground">
                                    Contact phone
                                </dt>
                                <dd className="tabular-nums text-sm text-foreground">{row.contactPhone || "—"}</dd>
                            </div>
                            {/* Submitted date */}
                            <div className="space-y-1 border-b py-2">
                                <dt className="text-xs font-semibold tracking-wide text-muted-foreground">
                                    Submitted
                                </dt>
                                <dd className="tabular-nums text-sm text-foreground">
                                    {new Date(row.createdAt).toLocaleString(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </dd>
                            </div>
                            {/* Rejection reason (if any) */}
                            {row.rejectionReason ? (
                                <div className="space-y-1 sm:col-span-2">
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Rejection reason
                                    </dt>
                                    <dd className="text-sm text-foreground">{row.rejectionReason}</dd>
                                </div>
                            ) : null}
                        </dl>
                    </div>
                )}
                <DialogFooter className="mt-4">
                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
                        {/* Close button */}
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-10 md:h-12 cursor-pointer text-sm"
                            disabled={isApproving}
                        >
                            Close
                        </Button>
                        {row?.status === "PENDING" ? (
                            <>
                                {/* Reject button */}
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    disabled={!canManage || isApproving}
                                    onClick={() => {
                                        if (!row) return;
                                        onOpenChange(false);
                                        onReject(row);
                                    }}
                                    className="h-10 md:h-12 cursor-pointer border border-rose-500/25 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-300"
                                >
                                    <X className="h-3 w-3" />
                                    Reject
                                </Button>
                                {/* Approve button */}
                                <LoadingButton
                                    type="button"
                                    size="sm"
                                    loading={isApproving}
                                    disabled={!canManage || isApproving}
                                    onClick={handleApprove}
                                    className="h-10 md:h-12 cursor-pointer border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
                                >
                                    <Check className="h-3 w-3" />
                                    Approve
                                </LoadingButton>
                            </>
                        ) : null}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
