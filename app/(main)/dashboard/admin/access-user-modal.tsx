"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shadcn/ui/button";
import { Badge } from "@/shadcn/ui/badge";
import { Input } from "@/shadcn/ui/input";
import { Switch } from "@/shadcn/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";

import { LoadingButton } from "@/shared-components/loading-button";
import { authClient } from "@/src/auth-client";
import { toast } from "sonner";

// Duration options for ban expiry
const BAN_DURATIONS = [
    { label: "Never expires", value: "never" },
    { label: "1 hour", value: "3600" },
    { label: "1 day", value: "86400" },
    { label: "1 week", value: "604800" },
    { label: "30 days", value: "2592000" },
] as const;

// type for user (in access mode)
type AccessUser = {
    id: string;
    email: string;
    role: string;
    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: Date | string | null;
};

// props for access user modal
type AccessUserModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    user: AccessUser | null;
};

// access user modal component
export function AccessUserModal({ open, onOpenChange, onSuccess, user }: AccessUserModalProps) {
    // loading state: ban
    const [banLoading, setBanLoading] = useState(false);

    // Ban form state — hidden until the toggle is flipped
    const [showBanForm, setShowBanForm] = useState(false);
    // ban reason and duration
    const [banReason, setBanReason] = useState("");
    const [banDuration, setBanDuration] = useState<string>("never");

    // Reset local state whenever the modal closes or opens for a different user
    useEffect(() => {
        if (!open) {
            setShowBanForm(false);
            setBanReason("");
            setBanDuration("never");
        }
    }, [open]);

    // handle ban toggle: flip the showBanForm state and reset the ban reason and duration
    function handleBanToggle(checked: boolean) {
        setShowBanForm(checked);
        if (!checked) {
            setBanReason("");
            setBanDuration("never");
        }
    }

    // handle ban: ban the user with the given reason and duration
    async function handleBan() {
        // if no user, return
        if (!user) return;
        // set ban loading to true
        setBanLoading(true);

        // ban the user with the given reason and duration
        const { error } = await authClient.admin.banUser({
            userId: user.id,
            ...(banReason.trim() && { banReason: banReason.trim() }),
            ...(banDuration !== "never" && { banExpiresIn: Number(banDuration) }),
        });

        // set ban loading to false
        setBanLoading(false);

        // if there is an error, show a toast error
        if (error) {
            toast.error("Failed to ban user. Please try again.");
            return;
        }

        // Otherwise, show a toast success
        toast.success("User has been suspended.");
        onSuccess?.();
        onOpenChange(false);
    }

    // handle unban: unban the user
    async function handleUnban() {
        // if no user, return
        if (!user) return;
        // set ban loading to true
        setBanLoading(true);

        // unban the user
        const { error } = await authClient.admin.unbanUser({ userId: user.id });

        // set ban loading to false
        setBanLoading(false);

        // if there is an error, show a toast error
        if (error) {
            toast.error("Failed to unban user. Please try again.");
            return;
        }

        // Otherwise, show a toast success
        toast.success("User suspension has been lifted.");
        onSuccess?.();
        onOpenChange(false);
    }

    // check if the user is banned
    const isBanned = !!user?.banned;
    // get the ban expires date
    const banExpiresDate = user?.banExpires ? new Date(user.banExpires) : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">

                <DialogHeader>
                    <DialogTitle className="text-left">Manage Access</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <div className="space-y-6">

                    {/* User context */}
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                        <Badge
                            variant="outline"
                            className={isBanned
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            }
                        >
                            {isBanned ? "Suspended" : "Active"}
                        </Badge>
                    </div>

                    {/* ── Ban / Unban section ── */}
                    <div className="space-y-3">

                        {isBanned ? (
                            // Already banned — show details and unban option
                            <div className="space-y-3">
                                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 space-y-1">
                                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                                        Account is currently suspended
                                    </p>
                                    {user?.banReason && (
                                        <p className="text-xs text-muted-foreground">
                                            Reason: {user.banReason}
                                        </p>
                                    )}
                                    {banExpiresDate && (
                                        <p className="text-xs text-muted-foreground">
                                            Expires: {banExpiresDate.toLocaleDateString(undefined, {
                                                year: "numeric", month: "short", day: "numeric",
                                            })}
                                        </p>
                                    )}
                                    {!banExpiresDate && (
                                        <p className="text-xs text-muted-foreground">No expiry — indefinite.</p>
                                    )}
                                </div>
                                <LoadingButton
                                    type="button"
                                    variant="outline"
                                    loading={banLoading}
                                    onClick={handleUnban}
                                    className="w-full h-10 md:h-12 cursor-pointer border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                >
                                    Lift Suspension
                                </LoadingButton>
                            </div>
                        ) : (
                            // Not banned — toggle reveals ban form
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                                    <p className="text-sm font-semibold text-foreground">Suspend this account</p>
                                    <Switch
                                        checked={showBanForm}
                                        onCheckedChange={handleBanToggle}
                                        aria-label="Toggle suspend account"
                                    />
                                </div>

                                {showBanForm && (
                                    <div className="space-y-3">
                                        <Input
                                            value={banReason}
                                            onChange={(e) => setBanReason(e.target.value)}
                                            placeholder="Reason (optional)"
                                            className="h-10 md:h-12"
                                        />
                                        <Select value={banDuration} onValueChange={setBanDuration}>
                                            <SelectTrigger className="h-10 md:h-12 w-full">
                                                <SelectValue placeholder="Duration" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BAN_DURATIONS.map((d) => (
                                                    <SelectItem key={d.value} value={d.value}>
                                                        {d.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <LoadingButton
                                            type="button"
                                            variant="destructive"
                                            loading={banLoading}
                                            onClick={handleBan}
                                            className="w-full h-10 md:h-12 cursor-pointer"
                                        >
                                            Confirm Suspension
                                        </LoadingButton>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Close */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full h-10 md:h-12 cursor-pointer"
                    >
                        Close
                    </Button>

                </div>

            </DialogContent>
        </Dialog>
    );
}