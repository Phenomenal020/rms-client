"use client";

import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { LoadingButton } from "@/shared-components/loading-button";

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    disabled?: boolean;
    onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    loading = false,
    disabled = false,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {/* Title of the confirmation dialog  */}
                <DialogHeader>
                    <DialogTitle className="text-left">{title}</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>
                {/* Descriptive text */}
                <p className="text-sm text-muted-foreground">{description}</p>
                <DialogFooter className="pt-4">
                    {/* Cancel Button */}
                    <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer h-10 md:h-12"
                    >
                        {cancelLabel}
                    </Button>
                    {/* Confirm Button */}
                    <LoadingButton
                        type="button"
                        variant="destructive"
                        loading={loading}
                        disabled={loading || disabled}
                        onClick={onConfirm}
                        className="cursor-pointer h-10 md:h-12"
                    >
                        {confirmLabel}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
