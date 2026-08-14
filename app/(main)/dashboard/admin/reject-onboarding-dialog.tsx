"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shadcn/ui/button";
import { Textarea } from "@/shadcn/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { LoadingButton } from "@/shared-components/loading-button";
import { getApiErrorMessage, useRejectOnboardingRequest } from "@/fetcher/mutations";
import type { OnboardingRequestRow } from "@/types/onboarding";

// Props for the reject onboarding dialog
type RejectOnboardingDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    row: OnboardingRequestRow | null;
};

export function RejectOnboardingDialog({ open, onOpenChange, row }: RejectOnboardingDialogProps) {
    // State for the rejection reason
    const [rejectionReason, setRejectionReason] = useState("");

    // Mutation for rejecting an onboarding request
    const { rejectOnboardingRequest, isMutating: isRejecting } = useRejectOnboardingRequest();

    // Handle opening and closing the dialog (The cancel button)
    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            setRejectionReason("");
            onOpenChange(false);
            return;
        }
        onOpenChange(true);
    }

    // Handle submitting the rejection reason (The reject button)
    async function handleRejectSubmit() {
        if (!row || !rejectionReason.trim()) return; // If no row or rejection reason, return
        try {  // Otherwise, submit the rejection reason
            await rejectOnboardingRequest({
                id: row.id,
                rejectionReason: rejectionReason.trim(),
            }); // toast success and reset dialog state
            toast.success(`Rejected "${row.organisationName}".`);
            setRejectionReason("");
            onOpenChange(false);
        } catch (err) { // If error, toast error and do not reset dialog state
            toast.error(getApiErrorMessage(err, "Failed to reject request. Please try again."));
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                {/* Reject Onboarding Request Title */}
                <DialogHeader>
                    <DialogTitle className="text-left">Reject onboarding request</DialogTitle>
                    <hr className="mt-2" />
                </DialogHeader>
                {/* Organisation name */}
                <div className="space-y-2">
                    {/* Rejection reason label */}
                    <label
                        htmlFor="onboardingRejectionReason"
                        className="text-sm font-semibold text-muted-foreground"
                    >
                        Rejection reason
                    </label>
                    {/* Rejection reason textarea */}
                    <Textarea
                        id="onboardingRejectionReason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this onboarding request is being rejected"
                        className="min-h-28 mt-2"
                    />
                </div>
                <DialogFooter className="mt-4">
                    <div className="grid w-full grid-cols-2 gap-2">
                        {/* Cancel button */}
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            className="h-10 md:h-12 cursor-pointer text-sm"
                            disabled={isRejecting}
                        >
                            Cancel
                        </Button>
                        {/* Reject button */}
                        <LoadingButton
                            type="button"
                            size="sm"
                            variant="destructive"
                            loading={isRejecting}
                            disabled={!rejectionReason.trim()}
                            onClick={handleRejectSubmit}
                            className="h-10 md:h-12 cursor-pointer text-sm"
                        >
                            Reject
                        </LoadingButton>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
