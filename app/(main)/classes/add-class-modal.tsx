"use client";

import { useMemo } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { BookOpen } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { CreateClassValues } from "./classes-form";
import { LoadingButton } from "@/shared-components/loading-button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/shadcn/ui/combobox";
import type { teacherOption } from "@/types/classes";

type AddClassModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    addForm: UseFormReturn<CreateClassValues>;
    onSubmit: (values: CreateClassValues) => Promise<void>;
    loading: boolean;
    readOnly?: boolean;
    teacherOptions: teacherOption[];
};

export function AddClassModal({
    open,
    onOpenChange,
    addForm,
    onSubmit,
    loading,
    readOnly = false,
    teacherOptions,
}: AddClassModalProps) {
    // Combobox items: Keep only value(id) and label(name). This allows the addition of a "Not Assigned" option with an empty string value.
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
                {/* Dialog header title and description */}
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

                            {/* Form field for the form teacher */}
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
                                                                <ComboboxItem key={item.value || "not-assigned"} value={item} className="text-sm">
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
                        </div>

                        <DialogFooter className="mt-4">
                            <div className={`grid ${readOnly ? "grid-cols-1" : "grid-cols-2"} justify-between gap-2 w-full`}>
                                {/* Close/Cancel button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loading}
                                    onClick={() => onOpenChange(false)}
                                    className="cursor-pointer h-10 md:h-12"
                                >
                                    {readOnly ? "Close" : "Cancel"}
                                </Button>
                                {/* Add Class button */}
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