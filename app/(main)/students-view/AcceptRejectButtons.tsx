"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { Textarea } from "@/shadcn/ui/textarea";

interface AcceptRejectButtonsProps {
    isGlobalEditing: boolean;
    className: string | null;
    onAccept: () => void | Promise<void>;
    onReject: (reason: string) => void | Promise<void>;
    canManage?: boolean;
}

export function AcceptRejectButtons({
    isGlobalEditing,
    className,
    onAccept,
    onReject,
    canManage = false,
}: AcceptRejectButtonsProps) {
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const title = className ? `${className} Result Sheet` : "Result Sheet";

    const handleRejectSubmit = async () => {
        await onReject(rejectionReason.trim());
        setRejectionReason("");
        setIsRejectModalOpen(false);
    };

    const handleRejectOpenChange = (open: boolean) => {
        setIsRejectModalOpen(open);
        if (!open) setRejectionReason("");
    };

    return (
        <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {title}
                </h1>

                {canManage && (
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-none">
                    <Button
                        type="button"
                        onClick={onAccept}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm cursor-pointer"
                        disabled={isGlobalEditing}
                    >
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Accept
                    </Button>
                    <Button
                        type="button"
                        onClick={() => setIsRejectModalOpen(true)}
                        size="sm"
                        variant="destructive"
                        className="text-xs sm:text-sm cursor-pointer"
                        disabled={isGlobalEditing}
                    >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Reject
                    </Button>
                </div>
                )}
            </div>

            <Dialog open={isRejectModalOpen} onOpenChange={handleRejectOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-left">Reject Record</DialogTitle>
                        <hr className="my-2" />
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="rejectionReason"
                                className="text-sm font-semibold text-muted-foreground"
                            >
                                Rejection Reason
                            </label>
                            <Textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(event) => setRejectionReason(event.target.value)}
                                placeholder="Instruct the form teacher why this record is being rejected"
                                className="min-h-28"
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <div className="grid grid-cols-2 justify-between gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleRejectOpenChange(false)}
                                className="cursor-pointer h-10 md:h-12"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleRejectSubmit}
                                className="cursor-pointer h-10 md:h-12"
                                variant="destructive"
                                disabled={!rejectionReason.trim()}
                            >
                                Submit
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
