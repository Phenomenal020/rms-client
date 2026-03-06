"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Calendar } from "@/shadcn/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shadcn/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { AddTermValues, EditTermValues } from "./term-setup-card";

// Read-only context passed in so the modal can display the locked fields
type TermContext = Pick<AddTermValues, "termName" | "academicYear">;

type EditTermModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<EditTermValues>;
    onSubmit: (values: EditTermValues) => void;
    loading: boolean;
    term: TermContext | null;
};

export function EditTermModal({ open, onOpenChange, form, onSubmit, loading, term }: EditTermModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>

                {/* Header */}
                <DialogHeader>
                    <DialogTitle className="text-left">Edit Term</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <div className="space-y-4">

                    {/* Academic Year — read-only */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">Academic Year (Session)</p>
                        <Input
                            value={term?.academicYear ?? ""}
                            readOnly
                            disabled
                            className="h-10 md:h-12 cursor-not-allowed opacity-60"
                        />
                    </div>

                    {/* Term Name — read-only */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">Term Name</p>
                        <Input
                            value={term?.termName ?? ""}
                            readOnly
                            disabled
                            className="h-10 md:h-12 cursor-not-allowed opacity-60"
                        />
                    </div>

                    {/* Editable fields inside the form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Start Date and End Date */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                {/* Start Date */}
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
                                                            variant="outline"
                                                            className={cn(
                                                                "h-10 md:h-12 w-full justify-between pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value
                                                                ? format(field.value, "MMM d, yyyy")
                                                                : <span>Pick a date</span>
                                                            }
                                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* End Date */}
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
                                                            variant="outline"
                                                            className={cn(
                                                                "h-10 md:h-12 w-full justify-between pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value
                                                                ? format(field.value, "MMM d, yyyy")
                                                                : <span>Pick a date</span>
                                                            }
                                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
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

                            {/* Term Days */}
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
                                                    field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
                                                }
                                                className="h-10 md:h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <hr className="my-2" />

                            {/* Footer */}
                            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={loading}
                                    className="cursor-pointer h-10 md:h-12"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="cursor-pointer h-10 md:h-12">
                                    Save Changes
                                </Button>
                            </DialogFooter>

                        </form>
                    </Form>
                </div>

            </DialogContent>
        </Dialog>
    );
}
