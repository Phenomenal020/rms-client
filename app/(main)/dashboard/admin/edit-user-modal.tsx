"use client";

import { useState, useEffect } from "react";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Badge } from "@/shadcn/ui/badge";
import { Switch } from "@/shadcn/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { authClient } from "@/src/auth-client";
import { toast } from "sonner";

// Role badge styling
const roleConfig: Record<string, { label: string; className: string }> = {
    admin:    { label: "Admin",     className: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300" },
    orgadmin: { label: "Org Admin", className: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300" },
    user:     { label: "User",      className: "border-border bg-muted text-muted-foreground" },
};

// edit user modal props
type EditUserModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    user: {
        id: string;
        email: string;
        role: string;
        firstName?: string | null;
        lastName?: string | null;
    } | null;
};

// edit user modal component — all fields are read-only; only role is changeable
export function EditUserModal({ open, onOpenChange, onSuccess, user }: EditUserModalProps) {

    // role change: toggle, selected role temp store, and loading state
    const [showRoleChange, setShowRoleChange] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [roleLoading, setRoleLoading] = useState(false);

    // Reset the role change toggle whenever the modal closes
    useEffect(() => {
        if (!open) {
            setShowRoleChange(false);
            setSelectedRole("");
        }
    }, [open]);

    // Get the role label and class name for the user
    const { label: roleLabel, className: roleClassName } = user
        ? (roleConfig[user.role] ?? { label: user.role, className: "" })
        : { label: "", className: "" };

    // Function to toggle role change section
    function handleRoleChangeToggle(checked: boolean) {
        setShowRoleChange(checked);
        if (!checked) setSelectedRole("");
    }

    // Function to handle the role change (to org admin or user) — fires immediately on selection
    async function handleRoleChange(role: string) {
        // return if no user or role is selected
        if (!user || !role) return;

        // set the selected role in the temp store and update the loading state
        setSelectedRole(role);
        setRoleLoading(true);

        // Call the update role api
        const { error } = await authClient.admin.setRole({
            userId: user.id,
            role: role as "admin" | "orgadmin" | "user",
        });

        // update the role loading state
        setRoleLoading(false);

        // handle error
        if (error) {
            toast.error(error.message ?? "Failed to update role. Please try again.");
            return;
        }

        // handle success
        toast.success(`Role updated to "${roleConfig[role]?.label ?? role}".`);
        onSuccess?.();
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">

                <DialogHeader>
                    <DialogTitle className="text-left">Edit User</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <div className="space-y-4">

                    {/* First Name — read-only display */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">First Name</p>
                        <Input
                            value={user?.firstName ?? ""}
                            readOnly
                            disabled
                            className="h-10 md:h-12 cursor-not-allowed opacity-60"
                        />
                    </div>

                    {/* Last Name — read-only display */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">Last Name</p>
                        <Input
                            value={user?.lastName ?? ""}
                            readOnly
                            disabled
                            className="h-10 md:h-12 cursor-not-allowed opacity-60"
                        />
                    </div>

                    {/* Email — read-only display */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">Email</p>
                        <Input
                            value={user?.email ?? ""}
                            readOnly
                            disabled
                            className="h-10 md:h-12 cursor-not-allowed opacity-60"
                        />
                    </div>

                    {/* Role — current badge + optional change dropdown */}
                    <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-muted-foreground">Change Role</p>
                            <Switch
                                checked={showRoleChange}
                                onCheckedChange={handleRoleChangeToggle}
                                aria-label="Toggle change role"
                                className="cursor-pointer"
                            />
                        </div>

                        {/* Always show the current role badge */}
                        <div className="flex h-8 items-center">
                            <Badge variant="outline" className={`text-sm font-medium opacity-80 ${roleClassName}`}>
                                {roleLabel}
                            </Badge>
                        </div>

                        {/* Dropdown only visible when the toggle is on */}
                        {showRoleChange && (
                            <div className="space-y-2 pt-1">
                                <Select
                                    value={selectedRole}
                                    onValueChange={handleRoleChange}
                                    disabled={roleLoading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select new role…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="orgadmin">Org Admin</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                                {roleLoading && (
                                    <p className="text-xs text-muted-foreground">Updating role…</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    {/* Close Button */}
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
