"use client";



import type { ReactNode } from "react";

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

    /** Optional inputs rendered between description and footer (e.g. unlock hours field). */

    children?: ReactNode;

    confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

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

    children,

    confirmVariant = "destructive",

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

                {children}

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

                        variant={confirmVariant}

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

