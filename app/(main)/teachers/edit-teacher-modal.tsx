"use client";

import { useState } from "react";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { LoadingButton } from "@/shared-components/loading-button";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";
import type { TeacherMember } from "./teachers-form";

type User = {
    id: string;
    role?: string;
    email?: string;
    twoFactorEnabled?: boolean;
    emailVerified?: boolean;
  } | undefined;   // for now.......

type EditTeacherModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: TeacherMember | null;
    removeMember: (email: string) => Promise<void>;
    canManage?: boolean;
    user: User;
};

export function EditTeacherModal({
    open,
    onOpenChange,
    teacher,
    removeMember,
    canManage = true,
    user,
}: EditTeacherModalProps) {
    const [removing, setRemoving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Close the details modal (and any open confirm dialog)
    function handleDetailsOpenChange(nextOpen: boolean) {
        if (!nextOpen) setConfirmOpen(false);
        onOpenChange(nextOpen);
    }

    // Onclick of the Remove Teacher button, open the confirmation dialog instead of removing immediately
    function handleRemoveClick() {
        if (!teacher || !canManage || teacher.id === user?.id) return;
        setConfirmOpen(true);
    }

    // remove member handler — runs only after confirmation
    async function handleConfirmRemove() {
        if (!teacher || !canManage || teacher.id === user?.id) return;
        setRemoving(true);
        try {
            await removeMember(teacher.email);
            setConfirmOpen(false);
        } finally {
            setRemoving(false);
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleDetailsOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-left">Teacher Details</DialogTitle>
                        <hr className="my-2" />
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground">Full Name</p>
                            <Input
                                value={teacher?.name ?? ""}
                                readOnly
                                disabled
                                className="h-10 md:h-12 cursor-not-allowed opacity-60"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground">Email</p>
                            <Input
                                value={teacher?.email ?? ""}
                                readOnly
                                disabled
                                className="h-10 md:h-12 cursor-not-allowed opacity-60"
                            />
                        </div>
                    </div>

                    {/* Danger Zone — hidden for the signed-in user so they cannot remove themselves */}
                    {canManage && teacher && teacher.id !== user?.id && (
                        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-2">
                            <p className="text-sm font-semibold text-destructive">Danger Zone</p>
                            <p className="text-xs text-muted-foreground">
                                Removing this teacher will revoke their access to the organisation immediately.
                            </p>
                            <LoadingButton
                                type="button"
                                variant="destructive"
                                className="cursor-pointer h-10 md:h-12 w-full"
                                disabled={removing || !teacher}
                                loading={false}
                                onClick={handleRemoveClick}
                            >
                                Remove Teacher from Organisation
                            </LoadingButton>
                        </div>
                    )}

                    {/* Close Button */}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDetailsOpenChange(false)}
                            className="cursor-pointer h-10 md:h-12"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm remove — second step so a misclick cannot revoke access */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Remove teacher?"
                description={
                    teacher
                        ? `Remove ${teacher.name} (${teacher.email}) from the organisation? They will lose access immediately.`
                        : "Remove this teacher from the organisation? They will lose access immediately."
                }
                confirmLabel="Remove Teacher"
                loading={removing}
                disabled={!teacher || teacher.id === user?.id}
                onConfirm={handleConfirmRemove}
            />
        </>
    );
}
