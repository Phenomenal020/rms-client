"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { AddGradingModal } from "./add-grading-modal";
import { EditGradingModal } from "./edit-grading-modal"

//  Schema 
// Per-entry schema — used by both add and edit modals
export const gradingEntrySchema = z.object({
    grade: z.string().trim().min(1, { message: "Grade is required" }),
    minScore: z.number().min(0, "Minimum Score must be greater than or equal to 0").max(100, "Maximum Score must be less than or equal to 100"),
    maxScore: z.number().min(0, "Minimum Score must be greater than or equal to 0").max(100, "Maximum Score must be less than or equal to 100"),
}).refine((data) => data.maxScore >= data.minScore, {
    message: "Max score must be greater than or equal to min score",
    path: ["maxScore"],
});
export type GradingEntryValues = z.infer<typeof gradingEntrySchema>;

//  Placeholder data 
const placeholderGradings: GradingEntryValues[] = [
    { grade: "A", minScore: 70, maxScore: 100 },
    { grade: "B", minScore: 60, maxScore: 69 },
    { grade: "C", minScore: 50, maxScore: 59 },
    { grade: "D", minScore: 40, maxScore: 49 },
    { grade: "E", minScore: 30, maxScore: 39 },
    { grade: "F", minScore: 0, maxScore: 29 },
];


//  Validation
// Checks that the full grading array covers exactly 0–100 with no gaps/overlaps
function validateGradingCoverage(entries: GradingEntryValues[]): string | null {
    if (entries.length === 0) return "At least one grade entry is required";

    const sorted = [...entries].sort((a, b) => a.minScore - b.minScore);

    if (sorted[0].minScore !== 0)
        return "Minimum Score must be 0";
    if (sorted[sorted.length - 1].maxScore !== 100)
        return "Maximum Score must be 100";

    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].maxScore + 1 !== sorted[i + 1].minScore)
            return "Grade ranges must be contiguous with no gaps or overlaps";
    }
    // return null if no overlaps
    return null;
}

// Returns true if [newMin, newMax] overlaps any existing entry (excluding the
// entry at skipIndex, used when editing)
function hasRangeOverlap(
    entries: GradingEntryValues[],
    newMin: number,
    newMax: number,
    skipIndex?: number,
): boolean {
    return entries.some((g, i) => {
        if (i === skipIndex) return false;
        return newMin < g.maxScore && newMax > g.minScore;
    });
}


// ─── Component ───────────────────────────────────────────────────────────────

export function GradingSystemCard() {
    // State: to track grading entries and whether changes have been made
    const [gradings, setGradings] = useState<GradingEntryValues[]>(placeholderGradings);
    const [gradingDirty, setGradingDirty] = useState(false);

    // States to open and close add/edit dialog boxes
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Derived: true when 0–100 is fully covered — disables the Add Grading button
    const isFullyCovered = validateGradingCoverage(gradings) === null;

    // Add form
    const addForm = useForm<GradingEntryValues>({
        resolver: zodResolver(gradingEntrySchema),
        defaultValues: { grade: "", minScore: 0, maxScore: 0 },
    });

    // Edit form
    const editForm = useForm<GradingEntryValues>({
        resolver: zodResolver(gradingEntrySchema),
        defaultValues: { grade: "", minScore: 0, maxScore: 0 },
    });

    // Handlers 
    // Open add grading dialog box
    function openAddDialog() {
        addForm.reset({ grade: "", minScore: 0, maxScore: 0 });
        setIsAddDialogOpen(true);
    }

    // Open edit grading dialog box
    function openEditDialog(index: number) {
        setEditingIndex(index);
        editForm.reset(gradings[index]);
        setIsEditDialogOpen(true);
    }

    // Add grading entry
    function addGrading(values: GradingEntryValues) {
        // check for overlapping grade ranges
        if (hasRangeOverlap(gradings, values.minScore, values.maxScore)) {
           toast.error("This range overlaps with an existing grade range");
            return;
        }
        // if no overlap, update local state
        setGradings((prev) => [...prev, values]);
        // Reset update tracker to enable save changes button
        setGradingDirty(true);
        // Close the add dialog box
        setIsAddDialogOpen(false);
        // Reset the add form
        addForm.reset({ grade: "", minScore: 0, maxScore: 0 });
        // Show success message
        toast.success(`Added grade "${values.grade}. Do not forget to save changes."`);
    }

    // Update grading entry
    function updateGrading(values: GradingEntryValues) {
        // if no editing index, return
        if (editingIndex === null) {
            toast.error("No grade selected to update");
            return;
        }
        // Again, check if this update causes overlapping grade ranges
        if (hasRangeOverlap(gradings, values.minScore, values.maxScore, editingIndex)) {
            toast.error("This range overlaps with an existing grade range");
            return;
        }
        // if no overlap, update local state
        setGradings((prev) => prev.map((g, i) => (i === editingIndex ? values : g)));
        // Reset update tracker to enable save changes button
        setGradingDirty(true);
        // Close the edit dialog box
        setIsEditDialogOpen(false);
        // Reset the editing index
        setEditingIndex(null);
        // Show success message
        toast.success(`Grade "${values.grade}" updated. Do not forget to save changes.`);
    }

    // Delete grading entry
    function deleteGrading(index: number) {
        // get the grade eg, "A"
        const label = gradings[index].grade;
        // Filter it off from the local state and return the new array
        setGradings((prev) => prev.filter((_, i) => i !== index));
        // Reset update tracker to enable save changes button
        setGradingDirty(true);
        // Show success message
        toast.success(`Deleted grade "${label}". Do not forget to save changes.`);
    }

    // Save grading system
    function handleSave() {
        // Validate errors
        const error = validateGradingCoverage(gradings);
        // if there are errors, show error message
        if (error) {
            toast.error("Invalid grading system", { description: error });
            return;
        }
        // Otherwise, make api call with grading payload
        // TODO: API call to save grading system
        setGradingDirty(false);
        toast.success("Grading system saved");
    }

    // Display highest grade first
    const sortedWithIndex = gradings
        .map((entry, index) => ({ entry, index }))
        .sort((a, b) => b.entry.minScore - a.entry.minScore);

    return (
        <>
            {/* Add Grading Modal */}
            <AddGradingModal
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                form={addForm}
                onSubmit={addGrading}
                loading={addForm.formState.isSubmitting}
            />

            {/* Edit Grading Modal */}
            <EditGradingModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                form={editForm}
                onSubmit={updateGrading}
                loading={editForm.formState.isSubmitting}
            />

            <Card className="border shadow-md">
                <CardContent className="space-y-4">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base md:text-lg font-semibold text-foreground">Grading System</h4>
                            {/* Add Grading Button */}
                            <Button type="button" onClick={openAddDialog} className="h-10 md:h-12" disabled={isFullyCovered}>
                                <Plus className="h-3 w-3" />
                                Add Grading
                            </Button>
                        </div>

                        <hr className="my-3" />

                        {/* Empty state */}
                        {gradings.length === 0 ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">No Grading yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto py-2">
                                <table className="min-w-[240px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="py-2 pr-2 w-[20%] md:w-[28%] font-semibold text-muted-foreground">Grade</th>
                                            <th className="py-2 pr-2 w-[24%] md:w-[28%] font-semibold text-muted-foreground">Min Score</th>
                                            <th className="py-2 pr-2 w-[24%] md:w-[28%] font-semibold text-muted-foreground">Max Score</th>
                                            <th className="py-2 w-[32%] md:w-[16%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedWithIndex.map(({ entry, index }) => (
                                            <tr
                                                key={`${entry.grade}-${index}`}
                                                className="border-b border-border last:border-b-0 hover:bg-muted/40"
                                            >
                                                <td className="py-2 pr-2 font-medium truncate">{entry.grade}</td>
                                                <td className="py-2 pr-2 truncate">{entry.minScore}</td>
                                                <td className="py-2 pr-2 truncate">{entry.maxScore}</td>
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
                                                            onClick={() => deleteGrading(index)}
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
                                {/* Discard changes */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!gradingDirty}
                                    onClick={() => { setGradings(placeholderGradings); setGradingDirty(false); }}
                                    className="w-max h-10 md:h-12"
                                >
                                    Discard Changes
                                </Button>
                                {/* Save changes */}
                                <Button
                                    type="button"
                                    disabled={!gradingDirty}
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