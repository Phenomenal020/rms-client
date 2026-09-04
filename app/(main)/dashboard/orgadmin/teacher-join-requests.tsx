"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyPending } from "@/shared-components/empty-pending";
import { ONBOARDING_JOIN_REQUESTS_KEY } from "@/fetcher/keys";
import { DashboardRequestsTableSkeleton } from "../helpers/dashboard-loading";
import { getTeacherJoinRequests } from "@/fetcher/queries";
import { getApiErrorMessage, useApproveTeacherJoinRequest, useRejectTeacherJoinRequest } from "@/fetcher/mutations";
import { useUser } from "@/contexts/user-context";
import type { TeacherJoinRequestRow } from "@/types/onboarding";
import { TeacherJoinRequestsTable } from "./teacher-join-requests-table";

// Default decline reason for teacher join requests
const DEFAULT_DECLINE_REASON = "Declined by organisation admin.";

export function TeacherJoinRequests() {
    const { mutate } = useSWRConfig();

    // Check the user is an org admin and has two-factor enabled
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && user.twoFactorEnabled === true;

    // Fetch the teacher join requests
    const {
        data: joinRequests = [],
        error: joinRequestsError,
        isLoading: isJoinRequestsLoading,
    } = getTeacherJoinRequests();

    // Action ID for the table
    const [actionId, setActionId] = useState<string | null>(null);

    // Mutations for approving and rejecting teacher join requests
    const { approveTeacherJoinRequest, isMutating: isApproving } = useApproveTeacherJoinRequest();
    const { rejectTeacherJoinRequest, isMutating: isRejecting } = useRejectTeacherJoinRequest();
    const busy = isApproving || isRejecting;

    // Handle approving a teacher join request
    async function handleApprove(row: TeacherJoinRequestRow) {
        setActionId(row.id);  // this request is now being processed (for the spinner)
        try {
            await approveTeacherJoinRequest({ id: row.id });
            toast.success(`Accepted ${row.name || row.email}.`);
        } catch (err) {   // Catch any mutation error (http, network, axios, etc.)
            toast.error(getApiErrorMessage(err, "Failed to accept join request."));
        } finally {
            setActionId(null);  // reset the action ID (disables the spinner)
        }
    }

    // Handle declining a teacher join request
    async function handleDecline(row: TeacherJoinRequestRow) {
        setActionId(row.id);
        try {
            await rejectTeacherJoinRequest({
                id: row.id,
                rejectionReason: DEFAULT_DECLINE_REASON,  // for now. Later, add the rejection reason input
            });
            toast.success(`Declined ${row.name || row.email}.`);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to decline join request."));
        } finally {
            setActionId(null);
        }
    }

    return (
        <Card className="border shadow-md">
            <CardContent>
                <section className="overflow-hidden rounded-sm bg-card">
                    {/* Teacher Join Requests title and description */}
                    <div className="space-y-1">
                        <h4 className="text-base font-semibold text-foreground md:text-lg">
                            Teacher Join Requests ({joinRequests?.length ?? 0})
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Requests to join your organisation.
                        </p>
                    </div>
                    <hr className="my-3" />

                    {/* If the join requests are loading and there are no join requests, show the loading skeleton */}
                    {isJoinRequestsLoading && (joinRequests?.length ?? 0) === 0 ? (
                        <DashboardRequestsTableSkeleton variant="org" rows={3} />
                    ) : joinRequestsError ? (
                        // If there is an error loading the join requests, show the error banner
                        <ErrorBanner
                            title="Could not load teacher join requests"
                            message={getApiErrorMessage(
                                joinRequestsError,
                                "Failed to load teacher join requests. Please try again.",
                            )}
                            onRetry={() => void mutate(ONBOARDING_JOIN_REQUESTS_KEY)}
                        />
                    ) : (!isJoinRequestsLoading && (joinRequests?.length ?? 0) === 0) ? (
                        // If there are actually no join requests after loading, show the empty pending component
                        <EmptyPending
                            embedded
                            title="No pending requests"
                            description="When teachers request to join your organisation, they will appear here."
                        />
                    ) : (
                        // If there are requests, show them in the table
                        <div className="py-3">
                            <TeacherJoinRequestsTable
                                requests={joinRequests ?? []}
                                canManage={canManage}
                                busy={busy}
                                actionId={actionId}
                                isApproving={isApproving}
                                isRejecting={isRejecting}
                                onApprove={handleApprove}
                                onDecline={handleDecline}
                            />
                        </div>
                    )}
                </section>
            </CardContent>
        </Card>
    );
}
