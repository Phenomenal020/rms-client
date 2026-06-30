"use client";

import { useEffect, useMemo, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import { LoadingButton } from "@/shared-components/loading-button";
import type { EditClassValues } from "./classes-form";
import type { teacherOption } from "@/types/classes";
import { singleGetSubjectPayload } from "@/types/subjects";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/shadcn/ui/combobox";


type EditClassModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editForm: UseFormReturn<EditClassValues>;
    onEditSubmit: (values: EditClassValues) => Promise<void>;
    loading: boolean;
    readOnly?: boolean;
    teacherOptions: teacherOption[];
    subjectOptions: singleGetSubjectPayload[];
    initialSubjects: singleGetSubjectPayload[];
};

export function EditClassModal({
    open,
    onOpenChange,
    editForm,
    onEditSubmit,
    loading,
    readOnly = false,
    teacherOptions,
    subjectOptions,
    initialSubjects = [],
}: EditClassModalProps) {

    // state to track the subjects that are checked (assigned to the class being edited)
    const [checkedSubjects, setCheckedSubjects] = useState<singleGetSubjectPayload[]>([]);

    // On render of the modal, sync the checkboxes to edit form's values. Rerender if open or form values change
    useEffect(() => {
        if (open) {
            setCheckedSubjects([...initialSubjects as singleGetSubjectPayload[]]);
            editForm.setValue("subjects", [...initialSubjects as singleGetSubjectPayload[]], {
                shouldDirty: false,
            });
        }
    }, [open, editForm]);

    // Sync subjects' changes to the form
    function syncSubjectsToForm(next: singleGetSubjectPayload[]) {
        editForm.setValue("subjects", next, { shouldDirty: true, shouldValidate: true });
    }

    // Toggle a subject's selection by adding or removing it from checkedSubjects
    function toggleSubject(subject: singleGetSubjectPayload) {
        setCheckedSubjects((prev) => {
            const next = prev.some((subj) => subj.name === subject.name)
                ? prev.filter((subj) => subj.name !== subject.name)
                : [...prev, subject];
            syncSubjectsToForm(next as singleGetSubjectPayload[]);
            return next as singleGetSubjectPayload[];
        });
    }

    // Handle the select all/deselect all button by modifying checkedSubjects based on allSelected state
    const allSelected =
        subjectOptions.length > 0 && checkedSubjects.length === subjectOptions.length;
    function handleSelectAll() {
        const next = allSelected ? [] : [...subjectOptions];
        setCheckedSubjects(next);
        syncSubjectsToForm(next);
    }

    const teacherComboboxItems = useMemo(
        () => [
            { value: "", label: "Not Assigned" },
            ...teacherOptions.map((t) => ({ value: t.id, label: t.name })),
        ],
        [teacherOptions],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xs">
                <DialogHeader>
                    <DialogTitle className="text-left">Edit Class</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
                        <div className="overflow-y-auto space-y-6 pr-1">
                            {/* Class Name */}
                            <FormField
                                control={editForm.control}
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

                            {/* Class Teacher */}
                            <FormField
                                control={editForm.control}
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
                                            {checkedSubjects.length} of {subjectOptions.length}{" "}
                                            selected
                                        </p>
                                    </div>
                                    {/* Select All/Deselect All Button */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAll}
                                        disabled={readOnly}
                                        className="h-8 text-xs cursor-pointer"
                                    >
                                        {allSelected ? "Deselect All" : "Select All"}
                                    </Button>
                                </div>

                                {/* Subject Checkboxes */}
                                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 rounded-md border border-border max-h-52 overflow-y-auto">
                                    {subjectOptions.map((subject) => (
                                        <label
                                            key={subject.id}
                                            htmlFor={`edit-subject-${subject.id}`}
                                            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer select-none"
                                        >
                                            <Checkbox
                                                id={`edit-subject-${subject.id}`}
                                                checked={checkedSubjects.some((subj) => subj.name === subject.name)}
                                                disabled={readOnly}
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
                                    disabled={loading || (!readOnly && !editForm.formState.isDirty)}
                                    onClick={() => onOpenChange(false)}
                                    className="cursor-pointer h-10 md:h-12"
                                >
                                    {readOnly ? "Close" : "Cancel"}
                                </Button>

                                {!readOnly && (
                                    <LoadingButton
                                        type="submit"
                                        disabled={loading || !editForm.formState.isDirty}
                                        loading={loading}
                                        className="cursor-pointer h-10 md:h-12"
                                    >
                                        Save Changes
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