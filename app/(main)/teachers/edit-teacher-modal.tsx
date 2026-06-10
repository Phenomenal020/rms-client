"use client";

import { useState } from "react";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { LoadingButton } from "@/shared-components/loading-button";
import type { TeacherMember } from "./teachers-form";

type EditTeacherModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: TeacherMember | null;
    removeMember: (email: string) => Promise<void>;
    canManage?: boolean;
};

export function EditTeacherModal({
    open,
    onOpenChange,
    teacher,
    removeMember,
    canManage = true,
}: EditTeacherModalProps) {
    const [removing, setRemoving] = useState(false);

    // remove member handler
    async function handleRemove() {
        if (!teacher || !canManage) return;
        setRemoving(true);
        try {
            await removeMember(teacher.email);
        } finally {
            setRemoving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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

                {/* Danger Zone */}
                {canManage && (
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
                            loading={removing}
                            onClick={handleRemove}
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
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer h-10 md:h-12"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
