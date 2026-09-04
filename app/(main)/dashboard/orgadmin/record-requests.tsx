"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyPending } from "@/shared-components/empty-pending";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { recordRequestsKey } from "@/fetcher/keys";
import { DashboardRequestsTableSkeleton } from "../helpers/dashboard-loading";
import { getRecentRequests, getTerms, type PendingRecordRequestRow } from "@/fetcher/queries";
import { getApiErrorMessage, useAcceptRequest, useRejectRequest } from "@/fetcher/mutations";
import { useUser } from "@/contexts/user-context";
import type { singleTermPayload } from "@/types/term";
import { RecordRequestsTable } from "./record-requests-table";

// Default decline reason for record requests
const DEFAULT_DECLINE_REASON = "Declined by organisation admin.";

export function RecordRequests({ title = "Record Requests" }: { title?: string }) {
    const { mutate } = useSWRConfig();

    // Check the user is an org admin and has two-factor enabled
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && user.twoFactorEnabled === true;

    // Resolve the active academic term (record requests are scoped to the current term)
    const { data: termsData, isLoading: isTermsLoading } = getTerms(true);
    const activeTermId =
        (termsData as singleTermPayload[] | null)?.find((t) => t.status === "ACTIVE")?.id ?? null;

    // Fetch pending record requests for the active term
    const {
        data: recentRequests = [],
        error: recordRequestsError,
        isLoading: isRecordRequestsLoading,
    } = getRecentRequests(activeTermId);

    // Action ID for the table
    const [actionId, setActionId] = useState<string | null>(null);

    // Mutations for accepting and rejecting record requests
    const { acceptRequest, isMutating: isAccepting } = useAcceptRequest();
    const { rejectRequest, isMutating: isRejecting } = useRejectRequest();
    const busy = isAccepting || isRejecting;

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
                    {/* Record Requests title and description */}
                    <div className="space-y-1">
                        <h4 className="text-base font-semibold text-foreground md:text-lg">
                            {title} ({recentRequests?.length ?? 0})
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Result approval requests for the current term.
                        </p>
                    </div>
                    <hr className="my-3" />

                    {/* If the terms are loading, show the loading skeleton */}
                    {isTermsLoading ? (
                        <DashboardRequestsTableSkeleton variant="org" rows={3} />
                    ) : !activeTermId ? (
                        // If there is no active term, show the empty no entry component
                        <EmptyNoEntry
                            embedded
                            title="No active term"
                            description="Select an academic term to see pending record requests for that term."
                            actionLabel="Set up term"
                            actionHref="/term"
                        />
                    ) : (isRecordRequestsLoading && (recentRequests?.length ?? 0) === 0) ? (
                        // If the record requests are loading and there are no record requests, show the loading skeleton
                        <DashboardRequestsTableSkeleton variant="org" rows={3} />
                    ) : recordRequestsError ? (
                        // If there is an error loading the record requests, show the error banner
                        <ErrorBanner
                            title="Could not load record requests"
                            message={getApiErrorMessage(
                                recordRequestsError,
                                "Failed to load record requests. Please try again.",
                            )}
                            onRetry={() => {
                                if (activeTermId) {
                                    void mutate(recordRequestsKey(activeTermId));
                                }
                            }}
                        />
                    ) : (recentRequests?.length ?? 0) === 0 ? (
                        // If there are no record requests for the active term, show the empty pending component
                        <EmptyPending
                            embedded
                            title="No pending requests for this term"
                            description="When teachers submit result sheets for approval, they will appear here."
                        />
                    ) : (
                        // If there are record requests, show them in the table
                        <div className="py-3">
                            <RecordRequestsTable
                                requests={recentRequests ?? []}
                                canManage={canManage}
                                busy={busy}
                                actionId={actionId}
                                isAccepting={isAccepting}
                                isRejecting={isRejecting}
                                onAccept={handleAccept}
                                onDecline={handleDecline}
                            />
                        </div>
                    )}
                </section>
            </CardContent>
        </Card>
    );
}
