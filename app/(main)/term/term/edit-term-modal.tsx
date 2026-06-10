"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Badge } from "@/shadcn/ui/badge";
import { Calendar } from "@/shadcn/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Dialog, DialogTitle, DialogHeader, DialogFooter, DialogContent } from "@/shadcn/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { EditTermValues } from "./term-setup-card";
import type { singleTermPayload } from "@/types/term";
import { LoadingButton } from "@/shared-components/loading-button";

type TermStatus = singleTermPayload["status"];

// Read-only context: locked fields + current saved status (badge reflects this until you save)
type TermContext = Pick<singleTermPayload, "term" | "academicYear" | "status">;

type EditTermModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<EditTermValues>;
    onSubmit: (values: EditTermValues) => void;
    loading: boolean;
    term: TermContext | null;
};

const STATUS_LABELS: Record<TermStatus, string> = {
    ACTIVE: "Active",
    DRAFT: "Draft",
    ARCHIVED: "Archived",
};

const TERM_SLOT_LABELS: Record<NonNullable<TermContext["term"]>, string> = {
    FIRST: "First",
    SECOND: "Second",
    THIRD: "Third",
};

function TermStatusBadge({ status }: { status: TermStatus | undefined }) {
    if (!status) return null;
    const label = STATUS_LABELS[status];
    const className =
        status === "ACTIVE"
            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100"
            : status === "DRAFT"
              ? "border-amber-500/40 bg-amber-500/15 text-amber-950 dark:text-amber-100"
              : "border-border bg-muted/80 text-muted-foreground";
    return (
        <Badge variant="outline" className={cn("text-xs font-semibold uppercase tracking-wide", className)}>
            {label}
        </Badge>
    );
}

export function EditTermModal({ open, onOpenChange, form, onSubmit, loading, term }: EditTermModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-left">Edit Term</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Saved lifecycle state (before submit) */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border border-border/80 bg-muted/30 px-3 py-2.5">
                            <div className="space-y-0.5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Current status
                                </p>
                                <p className="text-sm text-foreground">How this term is stored right now.</p>
                            </div>
                            <TermStatusBadge status={term?.status} />
                        </div>

                        {/* Change status (e.g. make active) */}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-muted-foreground">Set status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 w-full cursor-pointer md:h-12">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE" className="cursor-pointer">
                                                Active — current working term
                                            </SelectItem>
                                            <SelectItem value="DRAFT" className="cursor-pointer">
                                                Draft — not in use yet
                                            </SelectItem>
                                            <SelectItem value="ARCHIVED" className="cursor-pointer">
                                                Archived — closed term
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground">Academic Year (Session)</p>
                            <Input
                                value={term?.academicYear ?? ""}
                                readOnly
                                disabled
                                className="h-10 md:h-12 cursor-not-allowed opacity-60"
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground">Term Name</p>
                            <Input
                                value={term?.term ? TERM_SLOT_LABELS[term.term] : ""}
                                readOnly
                                disabled
                                className="h-10 md:h-12 cursor-not-allowed opacity-60"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="font-semibold text-muted-foreground">Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className={cn(
                                                            "h-10 md:h-12 w-full justify-between pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground",
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "MMM d, yyyy")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ?? undefined}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="font-semibold text-muted-foreground">End Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className={cn(
                                                            "h-10 md:h-12 w-full justify-between pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground",
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "MMM d, yyyy")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ?? undefined}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="termDays"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-muted-foreground">Term Days</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            placeholder="e.g. 70"
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? undefined : e.target.valueAsNumber,
                                                )
                                            }
                                            className="h-10 md:h-12"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-2 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="h-10 cursor-pointer md:h-12"
                            >
                                Cancel
                            </Button>
                            <LoadingButton
                                type="submit"
                                loading={loading}
                                disabled={!form.formState.isDirty}
                                className="h-10 cursor-pointer md:h-12"
                            >
                                Save Changes
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
