"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { AddAssessmentModal } from "./add-assessment-modal";
import { EditAssessmentModal } from "./edit-assessment-modal";

// Schema — used by both add and edit modals
export const assessmentEntrySchema = z.object({
    type: z.string().trim().min(1, { message: "Assessment type is required" }),
    percentage: z.number().min(0, "Minimum 0").max(100, "Maximum 100"),
    order: z.number().int().min(1, { message: "Order must be a positive integer" }),
});

export type AssessmentValues = z.infer<typeof assessmentEntrySchema>;

// Placeholder data
const placeholderAssessments: AssessmentValues[] = [
    { type: "CA 1", percentage: 20, order: 1 },
    { type: "CA 2", percentage: 20, order: 2 },
    { type: "Exam", percentage: 60, order: 3 },
];

// Validation: total must equal exactly 100% before saving
function validateAssessmentTotal(entries: AssessmentValues[]): string | null {
    if (entries.length === 0) return "At least one assessment component is required";
    const total = entries.reduce((sum, e) => sum + e.percentage, 0);
    if (total < 100) return `Total is ${total}%. Add more components to reach 100%.`;
    if (total > 100) return `Total is ${total}%. Adjust percentages to equal exactly 100%.`;
    return null;
}

// Component
export function AssessmentStructureCard() {
    // State: assessment entries and dirty tracker
    const [assessments, setAssessments] = useState<AssessmentValues[]>(placeholderAssessments);
    const [assessmentDirty, setAssessmentDirty] = useState(false);

    // States to open/close add/edit dialogs
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Derived: running total — disables Add button at 100%
    const assessmentTotal = assessments.reduce((sum, e) => sum + e.percentage, 0);

    // Add form
    const addForm = useForm<AssessmentValues>({
        resolver: zodResolver(assessmentEntrySchema),
        defaultValues: { type: "", percentage: 0, order: 1 },
    });

    // Edit form
    const editForm = useForm<AssessmentValues>({
        resolver: zodResolver(assessmentEntrySchema),
        defaultValues: { type: "", percentage: 0, order: 1 },
    });

    // Open add dialog
    function openAddDialog() {
        addForm.reset({ type: "", percentage: 0, order: assessments.length + 1 });
        setIsAddDialogOpen(true);
    }

    // Open edit dialog
    function openEditDialog(index: number) {
        setEditingIndex(index);
        editForm.reset(assessments[index]);
        setIsEditDialogOpen(true);
    }

    // Add assessment entry
    function addAssessment(values: AssessmentValues) {
        // Check for duplicate order number
        const duplicateOrder = assessments.some((a) => a.order === values.order);
        if (duplicateOrder) {
            addForm.setError("order", { message: `Order ${values.order} is already used` });
            return;
        }
        // Check that adding this won't push total over 100%
        if (assessmentTotal + values.percentage > 100) {
            addForm.setError("percentage", {
                message: `Adding ${values.percentage}% would exceed 100%. Remaining: ${100 - assessmentTotal}%`,
            });
            return;
        }
        setAssessments((prev) => [...prev, values]);
        setAssessmentDirty(true);
        setIsAddDialogOpen(false);
        addForm.reset({ type: "", percentage: 0, order: 1 });
        toast.success(`Added "${values.type}". Do not forget to save changes.`);
    }

    // Update assessment entry
    function updateAssessment(values: AssessmentValues) {
        if (editingIndex === null) {
            toast.error("No assessment selected to update");
            return;
        }
        // Check for duplicate order (exclude current entry)
        const duplicateOrder = assessments.some((a, i) => i !== editingIndex && a.order === values.order);
        if (duplicateOrder) {
            editForm.setError("order", { message: `Order ${values.order} is already used` });
            return;
        }
        // Check that swapping this entry's percentage doesn't push total over 100%
        const oldPercentage = assessments[editingIndex].percentage;
        const newTotal = assessmentTotal - oldPercentage + values.percentage;
        if (newTotal > 100) {
            editForm.setError("percentage", {
                message: `This would set total to ${newTotal}%. Max allowed: ${100 - assessmentTotal + oldPercentage}%`,
            });
            return;
        }
        setAssessments((prev) => prev.map((a, i) => (i === editingIndex ? values : a)));
        setAssessmentDirty(true);
        setIsEditDialogOpen(false);
        setEditingIndex(null);
        toast.success(`"${values.type}" updated. Do not forget to save changes.`);
    }

    // Delete assessment entry
    function deleteAssessment(index: number) {
        const label = assessments[index].type;
        setAssessments((prev) => prev.filter((_, i) => i !== index));
        setAssessmentDirty(true);
        toast.success(`Deleted "${label}". Do not forget to save changes.`);
    }

    // Save assessment structure
    function handleSave() {
        const error = validateAssessmentTotal(assessments);
        if (error) {
            toast.error("Invalid assessment structure", { description: error });
            return;
        }
        // TODO: API call to save assessment structure
        setAssessmentDirty(false);
        toast.success("Assessment structure saved");
    }

    // Sort by order ascending for display
    const sortedWithIndex = assessments
        .map((entry, index) => ({ entry, index }))
        .sort((a, b) => a.entry.order - b.entry.order);

    return (
        <>
            {/* Add Assessment Modal */}
            <AddAssessmentModal
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                form={addForm}
                onSubmit={addAssessment}
                loading={addForm.formState.isSubmitting}
                remainingPercentage={100 - assessmentTotal}
            />

            {/* Edit Assessment Modal */}
            <EditAssessmentModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                form={editForm}
                onSubmit={updateAssessment}
                loading={editForm.formState.isSubmitting}
            />

            <Card className="border shadow-md">
                <CardContent className="space-y-4">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base md:text-lg font-semibold text-foreground">Assessment Structure</h4>
                            {/* Add Assessment Button — disabled (not hidden) when total is 100% */}
                            <Button
                                type="button"
                                onClick={openAddDialog}
                                className="h-10 md:h-12"
                                disabled={assessmentTotal >= 100}
                            >
                                <Plus className="h-3 w-3" />
                                Add Assessment
                            </Button>
                        </div>

                        <hr className="my-3" />

                        {/* Total percentage indicator */}
                        {assessments.length > 0 && assessmentTotal !== 100 && (
                            <p className="text-xs text-destructive pb-1">
                                {assessmentTotal < 100
                                    ? `Total: ${assessmentTotal}% — ${100 - assessmentTotal}% remaining`
                                    : `Total: ${assessmentTotal}% — exceeds 100%`}
                            </p>
                        )}

                        {/* Empty state */}
                        {assessments.length === 0 ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">
                                    No Assessment Created. Please add assessment to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto py-2">
                                <table className="min-w-[320px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="py-2 pr-2 w-[27%] md:w-[28%] font-semibold text-muted-foreground">Type</th>
                                            <th className="py-2 pr-2 w-[28%] font-semibold text-muted-foreground">Percentage</th>
                                            <th className="py-2 pr-2 w-[25%] md:w-[28%] font-semibold text-muted-foreground">Order</th>
                                            <th className="py-2 w-[20%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedWithIndex.map(({ entry, index }) => (
                                            <tr
                                                key={`${entry.type}-${index}`}
                                                className="border-b border-border last:border-b-0 hover:bg-muted/40"
                                            >
                                                <td className="py-2 pr-2 font-medium truncate">{entry.type}</td>
                                                <td className="py-2 pr-2 truncate">{entry.percentage}%</td>
                                                <td className="py-2 pr-2 truncate">#{entry.order}</td>
                                                <td className="py-2">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Edit Button */}
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => openEditDialog(index)}
                                                            className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm md:text-base"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </Button>
                                                        {/* Delete Button */}
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => deleteAssessment(index)}
                                                            className="cursor-pointer border border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300 text-sm md:text-base"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            <span className="hidden sm:inline">Delete</span>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Save and Discard Changes */}
                        <div className="pt-3 border-t border-border mt-2 md:mt-4">
                            <div className="flex justify-center gap-2">
                                {/* Discard Changes Button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!assessmentDirty}
                                    onClick={() => { setAssessments(placeholderAssessments); setAssessmentDirty(false); }}
                                    className="w-max h-10 md:h-12"
                                >
                                    Discard Changes
                                </Button>
                                {/* Save Changes Button */}
                                <Button
                                    type="button"
                                    disabled={!assessmentDirty}
                                    onClick={handleSave}
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