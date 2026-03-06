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
import { BookOpen } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { AddStudentValues } from "./students-form";

// ─── Types ────────────────────────────────────────────────────────────────────
type StudentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<AddStudentValues>;
    onSubmit: (values: AddStudentValues, subjects: string[]) => Promise<void>;
    loading: boolean;
    classOptions: string[];
    subjectOptions: string[];
    /** Pre-selected subjects (used in edit mode). */
    initialSubjects?: string[];
    /** Controls dialog title and submit button label. Defaults to "add". */
    mode?: "add" | "edit";
};

// ─── Component ────────────────────────────────────────────────────────────────
export function StudentModal({
    open,
    onOpenChange,
    form,
    onSubmit,
    loading,
    classOptions,
    subjectOptions,
    initialSubjects = [],
    mode = "add",
}: StudentModalProps) {
    const isEdit = mode === "edit";
    const [checked, setChecked] = useState<string[]>([]);

    // Sync checkboxes whenever the modal opens
    useEffect(() => {
        if (open) setChecked([...initialSubjects]);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const allSelected = checked.length === subjectOptions.length;

    function toggle(subject: string) {
        setChecked((prev) =>
            prev.includes(subject)
                ? prev.filter((s) => s !== subject)
                : [...prev, subject]
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Student" : "Add Student"}</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {isEdit
                            ? "Update the student's details, class, and subject enrolment."
                            : "Enter the student's details and optionally enrol them in subjects."}
                    </p>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((values) => onSubmit(values, checked))}>
                        <div className="space-y-4">

                            {/* First name + Middle name */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">
                                                First Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} className="h-10 md:h-12" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="middleName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">
                                                Middle Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Michael (optional)"
                                                    {...field}
                                                    className="h-10 md:h-12"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Last name + Gender */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">
                                                Last Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} className="h-10 md:h-12" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">
                                                Gender
                                            </FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="h-10 md:h-12 w-full cursor-pointer">
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Class */}
                            <FormField
                                control={form.control}
                                name="className"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">
                                            Class
                                        </FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="h-10 md:h-12 w-full cursor-pointer">
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classOptions.map((cls) => (
                                                        <SelectItem key={cls} value={cls}>
                                                            {cls}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ── Subject Enrolment ─────────────────────────────── */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <FormLabel className="font-semibold text-muted-foreground">
                                        Subjects
                                    </FormLabel>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {checked.length} of {subjectOptions.length} selected
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setChecked(allSelected ? [] : [...subjectOptions])
                                            }
                                            className="h-7 text-xs cursor-pointer"
                                        >
                                            {allSelected ? "Deselect All" : "Select All"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 rounded-md border border-border p-2 max-h-48 overflow-y-auto">
                                    {subjectOptions.map((subject) => (
                                        <label
                                            key={subject}
                                            htmlFor={`modal-subj-${subject}`}
                                            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer select-none"
                                        >
                                            <Checkbox
                                                id={`modal-subj-${subject}`}
                                                checked={checked.includes(subject)}
                                                onCheckedChange={() => toggle(subject)}
                                            />
                                            <span className="text-sm text-foreground">{subject}</span>
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
                                className="cursor-pointer h-10 md:h-12"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer h-10 md:h-12"
                            >
                                <BookOpen className="h-3 w-3" />
                                {isEdit ? "Save Changes" : "Add Student"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
