"use client";

import { useEffect, useState } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shadcn/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { AddClassValues } from "./classes-form";

// ─── Types ────────────────────────────────────────────────────────────────────
type ClassModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<AddClassValues>;
    /** Called on valid submit — receives form values + the selected subjects array. */
    onSubmit: (values: AddClassValues, selectedSubjects: string[]) => Promise<void>;
    loading: boolean;
    teacherOptions: string[];
    subjectOptions: string[];
    /** Pre-selected subjects to seed the checkbox list (edit mode). Defaults to []. */
    initialSubjects?: string[];
    /** Controls dialog title and submit label. Defaults to "add". */
    mode?: "add" | "edit";
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ClassModal({
    open,
    onOpenChange,
    form,
    onSubmit,
    loading,
    teacherOptions,
    subjectOptions,
    initialSubjects = [],
    mode = "add",
}: ClassModalProps) {
    const isEdit = mode === "edit";

    // Internal subject-checkbox state; reset whenever the modal opens
    const [checkedSubjects, setCheckedSubjects] = useState<string[]>([]);
    useEffect(() => {
        if (open) setCheckedSubjects([...initialSubjects]);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const allSelected = checkedSubjects.length === subjectOptions.length;

    function toggleSubject(subject: string) {
        setCheckedSubjects((prev) =>
            prev.includes(subject)
                ? prev.filter((s) => s !== subject)
                : [...prev, subject]
        );
    }

    function handleSubmit(values: AddClassValues) {
        return onSubmit(values, checkedSubjects);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Class" : "Add Class"}</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {isEdit
                            ? "Update the class name, teacher, and subjects."
                            : "Enter the class details and assign subjects."}
                    </p>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        {/* ── Scrollable body ─────────────────────────────── */}
                        <div className="max-h-[65vh] overflow-y-auto space-y-5 pr-1">

                            {/* Class Name */}
                            <FormField
                                control={form.control}
                                name="className"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">
                                            Class Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. JSS 1A"
                                                {...field}
                                                className="h-12 md:h-14"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Class Teacher */}
                            <FormField
                                control={form.control}
                                name="teacher"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">
                                            Class Teacher
                                        </FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value || "__unassigned__"}
                                                onValueChange={(val) =>
                                                    field.onChange(
                                                        val === "__unassigned__" ? "" : val
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-12 md:h-14 w-full cursor-pointer">
                                                    <SelectValue placeholder="Select teacher" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="__unassigned__">
                                                        Not assigned
                                                    </SelectItem>
                                                    {teacherOptions.map((t) => (
                                                        <SelectItem key={t} value={t}>
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <hr />

                            {/* ── Subjects section ────────────────────────── */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground">
                                            Subjects
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {checkedSubjects.length} of {subjectOptions.length} selected
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCheckedSubjects(
                                                allSelected ? [] : [...subjectOptions]
                                            )
                                        }
                                        className="h-8 text-xs cursor-pointer"
                                    >
                                        {allSelected ? "Deselect All" : "Select All"}
                                    </Button>
                                </div>

                                {/* 2-column checkbox grid */}
                                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 rounded-md border border-border p-2 max-h-52 overflow-y-auto">
                                    {subjectOptions.map((subject) => (
                                        <label
                                            key={subject}
                                            htmlFor={`${mode}-subject-${subject}`}
                                            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer select-none"
                                        >
                                            <Checkbox
                                                id={`${mode}-subject-${subject}`}
                                                checked={checkedSubjects.includes(subject)}
                                                onCheckedChange={() => toggleSubject(subject)}
                                            />
                                            <span className="text-sm text-foreground">
                                                {subject}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <hr className="my-4" />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="cursor-pointer h-12 md:h-14"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer h-12 md:h-14"
                            >
                                {isEdit ? "Save Changes" : "Add Class"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
