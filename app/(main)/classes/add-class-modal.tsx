"use client";

import { useEffect, useMemo, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { BookOpen } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { CreateClassValues } from "./classes-form";
import { LoadingButton } from "@/shared-components/loading-button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/shadcn/ui/combobox";
import type { singleGetSubjectPayload } from "@/types/subjects";
import type { teacherOption } from "@/types/classes";

type AddClassModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    addForm: UseFormReturn<CreateClassValues>;
    onSubmit: (values: CreateClassValues) => Promise<void>;
    loading: boolean;
    readOnly?: boolean;
    teacherOptions: teacherOption[];
    subjectOptions: singleGetSubjectPayload[];
    canAssignSubjects?: boolean;
};

export function AddClassModal({
    open,
    onOpenChange,
    addForm,
    onSubmit,
    loading,
    readOnly = false,
    teacherOptions,
    subjectOptions,
    canAssignSubjects = true,
}: AddClassModalProps) {
    // state to track the subjects that are checked (assigned to the class)
    const [checkedSubjects, setCheckedSubjects] = useState<singleGetSubjectPayload[]>([]);

    // On render of the modal, sync the subjects checkboxes to add form's values. Rerender if open or form values change
    useEffect(() => {
        if (open) {
            const fromForm = addForm.getValues("subjects") ?? [];
            setCheckedSubjects([...fromForm]);
        }
    }, [open, addForm]);

    // Sync subjects' changes to the form 
    function syncSubjectsToForm(next: singleGetSubjectPayload[]) {
        addForm.setValue("subjects", next, { shouldDirty: true, shouldValidate: true });
    }

    // Toggle a subject's selection by adding or removing it from checkedSubjects
    function toggleSubject(subject: singleGetSubjectPayload) {
        setCheckedSubjects((prev) => {
            const next = prev.some((s) => s.id === subject.id)
                ? prev.filter((s) => s.id !== subject.id)
                : [...prev, subject];
            syncSubjectsToForm(next);
            return next;
        });
    }

    // Combobox items: Keep only value(id) and label(name). This allows the addition of a "Not Assigned" option with an empty string value.
    const teacherComboboxItems = useMemo(
        () => [
            { value: "", label: "Not Assigned" },
            ...teacherOptions.map((t) => ({ value: t.id, label: t.name })),
        ],
        [teacherOptions],
    );

    // Handle the select all/deselect all button by modifying checkedSubjects based on allSelected state
    const subjectsDisabled = readOnly || !canAssignSubjects;
    const allSelected = subjectOptions.length > 0 && checkedSubjects.length === subjectOptions.length;
    function handleSelectAll() {
        const next = allSelected ? [] : [...subjectOptions];
        setCheckedSubjects(next);
        syncSubjectsToForm(next);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xs">
                <DialogHeader>
                    <DialogTitle className="text-left">Add Class</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Enter the class details and assign subjects.
                    </p>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...addForm}>
                    <form onSubmit={addForm.handleSubmit(onSubmit)}>
                        <div className="max-h-[65vh] overflow-y-auto space-y-5 pr-1">
                            {/* Class Name */}
                            <FormField
                                control={addForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">
                                            Class Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. JSS 1A"
                                                {...field}
                                                disabled={readOnly}
                                                className="h-10 md:h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Form field for the class teacher */}
                            <FormField
                                control={addForm.control}
                                name="formTeacherId"
                                render={({ field }) => {
                                    const selectedItem =
                                        teacherComboboxItems.find((item) => item.value === field.value) ??
                                        teacherComboboxItems[0];

                                    return (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">
                                                Class Teacher
                                            </FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    items={teacherComboboxItems}
                                                    value={selectedItem}
                                                    isItemEqualToValue={(a, b) => a.value === b.value}
                                                    onValueChange={(item) =>
                                                        field.onChange(item?.value ?? "")
                                                    }
                                                    disabled={readOnly}
                                                >
                                                    {/* render the label as the name */}
                                                    <ComboboxInput placeholder="Select teacher" />
                                                    <ComboboxContent>
                                                        <ComboboxEmpty>No teacher found</ComboboxEmpty>
                                                        <ComboboxList>
                                                            {teacherComboboxItems.map((item) => (
                                                                <ComboboxItem key={item.value || "not-assigned"} value={item}>
                                                                    {item.label}
                                                                </ComboboxItem>
                                                            ))}
                                                        </ComboboxList>
                                                    </ComboboxContent>
                                                </Combobox>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            {/* Subjects */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground">
                                            Subjects
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {canAssignSubjects
                                                ? `${checkedSubjects.length} of ${subjectOptions.length} selected`
                                                : "Subjects can be assigned after an academic term is active"}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAll}
                                        disabled={subjectsDisabled}
                                        className="h-8 text-xs cursor-pointer"
                                    >
                                        {allSelected ? "Deselect All" : "Select All"}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 rounded-md border border-border p-2 max-h-52 overflow-y-auto">
                                    {subjectOptions.map((subject) => (
                                        <label
                                            key={subject.id}
                                            htmlFor={`add-subject-${subject.id}`}
                                            className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/50 select-none ${subjectsDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                                        >
                                            <Checkbox
                                                id={`add-subject-${subject.id}`}
                                                checked={checkedSubjects.some((s) => s.id === subject.id)}
                                                disabled={subjectsDisabled}
                                                onCheckedChange={() => toggleSubject(subject)}
                                            />
                                            <span className="text-sm text-foreground">
                                                {subject.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <div className={`grid ${readOnly ? "grid-cols-1" : "grid-cols-2"} justify-between gap-2 w-full`}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loading}
                                    onClick={() => onOpenChange(false)}
                                    className="cursor-pointer h-10 md:h-12"
                                >
                                    {readOnly ? "Close" : "Cancel"}
                                </Button>
                                {!readOnly && (
                                    <LoadingButton
                                        type="submit"
                                        disabled={loading || !addForm.formState.isDirty}
                                        loading={loading}
                                        className="cursor-pointer h-10 md:h-12"
                                    >
                                        <BookOpen className="h-3 w-3" />
                                        Add Class
                                    </LoadingButton>
                                )}
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
