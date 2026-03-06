"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import SmallTermText from "@/shared-components/small-term-text";
import { AddTermModal } from "./add-term-modal";
import { EditTermModal } from "./edit-term-modal";

// schema for adding term
export const addTermSchema = z.object({
    termName: z.string().trim().min(1, { message: "Term name is required" }),
    academicYear: z.string().trim().min(1, { message: "Academic year is required" }),
    startDate: z.date({ error: "Start date is required" }),
    endDate: z.date({ error: "End date is required" }),
    termDays: z.number().int().min(1).optional(),
});

// schema for editing term
export const editTermSchema = z.object({
    startDate: z.date({ error: "Start date is required" }),
    endDate: z.date({ error: "End date is required" }),
    termDays: z.number().int().min(1).optional(),
});

// types for the form values
export type AddTermValues = z.infer<typeof addTermSchema>;
export type EditTermValues = z.infer<typeof editTermSchema>;

// Placeholder data
const placeholderTerm: AddTermValues = {
    termName: "FirstFirstFirstFirst",
    academicYear: "2024/2025",
    startDate: new Date("2024-09-09"),
    endDate: new Date("2024-12-13"),
    termDays: 70,
}


// Component
export function TermSetupCard() {
    // States: term and whether term fields should be updated.
    const [term, setTerm] = useState<AddTermValues>(placeholderTerm);
    const [termDirty, setTermDirty] = useState(false);

    // Add term modal state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Edit term modal state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Add term form: resolver and default values.
    const addForm = useForm<AddTermValues>({
        resolver: zodResolver(addTermSchema),
        defaultValues: {
            termName: placeholderTerm.termName,
            academicYear: placeholderTerm.academicYear,
            startDate: placeholderTerm.startDate,
            endDate: placeholderTerm.endDate,
            termDays: placeholderTerm.termDays,
        },
    });

    // Edit form: resolver and default values.
    const editForm = useForm<EditTermValues>({
        resolver: zodResolver(editTermSchema),
        defaultValues: {
            startDate: placeholderTerm.startDate,
            endDate: placeholderTerm.endDate,
            termDays: placeholderTerm.termDays,
        },
    });

    // Handlers: open add and edit dialogs, add and update term.
    function openAddDialog() {
        addForm.reset({ termName: "", academicYear: "", termDays: undefined });
        setIsAddDialogOpen(true);
    }

    // On click the edit form icon, set isEditDialogOpen state to true
    function openEditDialog(term: AddTermValues) {
        setIsEditDialogOpen(true);
    }

    // Function to add a term. TODO: AMake api call
    function addTerm(values: AddTermValues) {
        setTerm(values); // update local state (    TODO: Is this required when api call is in place?)
        setTermDirty(true);
        setIsAddDialogOpen(false);  // close add dialog
        addForm.reset({ termName: "", academicYear: "", termDays: undefined });  // reset add form
        toast.success(`Added "${values.termName}"`);
    }

    // Function to update a term. TODO: Make api call
    function updateTerm(values: EditTermValues) {
        setTerm(prev => ({ ...prev, ...values })); // update local state (TODO: Is this required when api call is in place?)
        setTermDirty(true);
        setIsEditDialogOpen(false); // close edit dialog
        editForm.reset({ startDate: placeholderTerm.startDate, endDate: placeholderTerm.endDate, termDays: placeholderTerm.termDays }); // reset edit form
        toast.success(`Updated "${term.termName}"`);
    }

    return (
        <>
            {/* Component Header */}
            <section className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Term Setup</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Add Term Modal */}
            <AddTermModal
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                form={addForm}
                onSubmit={addTerm}
                loading={addForm.formState.isSubmitting}
            />

            {/* Edit Term Modal */}
            <EditTermModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                form={editForm}
                onSubmit={updateTerm}
                loading={editForm.formState.isSubmitting}
                term={term}
            />

            {/* Term Setup Card */}
            <Card className="border shadow-md">
                <CardContent className="space-y-4">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-3">
                            {!term && (
                                <Button type="button" onClick={openAddDialog} className="h-10 md:h-12">
                                    <Plus className="h-3 w-3" />
                                    Add Term
                                </Button>
                            )}
                        </div>

                        {/* Empty state */}
                        {!term ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">
                                    No Term Created. Please add a term to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto py-3">
                                <table className="min-w-[440px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="py-2 pr-1 w-[20%] md:w-[18%] font-semibold text-muted-foreground">Session</th>
                                            <th className="py-2 pr-1 w-[15%] md:w-[18%] font-semibold text-muted-foreground">Term</th>
                                            <th className="py-2 pr-1 w-[22.5%] md:w-[18%] font-semibold text-muted-foreground">Start Date</th>
                                            <th className="py-2 pr-1 w-[22.5%] md:w-[18%] font-semibold text-muted-foreground">End Date</th>
                                            <th className="py-2 pr-1 w-[10%] md:w-[18%] font-semibold text-muted-foreground">Days</th>
                                            <th className="py-2 w-[10%] md:w-[10%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        <tr
                                            className="border-b border-border last:border-b-0 hover:bg-muted/40"
                                        >
                                            <td className="py-2 pr-1 font-medium truncate">{term.academicYear}</td>
                                            <td className="py-2 pr-1 font-medium truncate">{term.termName}</td>
                                            <td className="py-2 pr-1 text-muted-foreground truncate">{format(term.startDate, "MMM d, yyyy")}</td>
                                            <td className="py-2 pr-1 text-muted-foreground truncate">{format(term.endDate, "MMM d, yyyy")}</td>
                                            <td className="py-2 pr-1 truncate">{term.termDays ?? "—"}</td>
                                            <td className="py-2 text-right">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openEditDialog(term)}
                                                    className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm md:text-base"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Save / Discard */}
                        <div className="pt-3 md:pt-4 border-t border-border mt-2 md:mt-4">
                            <div className="flex justify-center gap-2">
                                {/* Discard Changes Button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!termDirty}
                                    onClick={() => { setTerm(placeholderTerm); setTermDirty(false); }}
                                    className="w-max h-10 md:h-12"
                                >
                                    Discard Changes
                                </Button>

                                {/* Save Changes Button */}
                                <Button
                                    type="button"
                                    disabled={!termDirty}
                                    onClick={() => { setTermDirty(false); toast.success("Term setup saved"); }}
                                    className="w-max h-10 md:h-12"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>

                    </section>
                </CardContent>
            </Card>
        </>
    );
}
