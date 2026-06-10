"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { LoadingButton } from "@/shared-components/loading-button";
import { ErrorBanner } from "@/shared-components/error-banner";
import { AddGradingModal } from "./add-grading-modal";
import { EditGradingModal } from "./edit-grading-modal";
import { useSaveGradingSystem, getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { getGradingSystem } from "@/fetcher/queries";
import type { getSingleGradingEntry, GradingEntryPayload } from "@/types/term";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { GradingTableSkeleton } from "../term-loading-skeletons";

// Used by both add and edit modals
export const gradingEntrySchema = z.object({
    grade: z.string().trim().min(1, { message: "Grade is required" }),
    minScore: z.number().min(0, "Min score must be ≥ 0").max(100, "Min score must be ≤ 100"),
    maxScore: z.number().min(0, "Max score must be ≥ 0").max(100, "Max score must be ≤ 100"),
}).refine((data) => data.maxScore >= data.minScore, {
    message: "Max score must be ≥ min score",
    path: ["maxScore"],
});
export type GradingEntryValues = z.infer<typeof gradingEntrySchema>;

//Custom Validation: checks that the full grading array covers exactly 0–100 with no gaps or overlaps
function validateGradingCoverage(entries: GradingEntryValues[]): string | null {
    // If there are no entries, return an error
    if (entries.length === 0) return "At least one grade entry is required";

    // Otherwise, sort the entries by minScore
    const sorted = [...entries].sort((a, b) => a.minScore - b.minScore);

    // If the lowest grade range does not start at 0, return an error
    if (sorted[0].minScore !== 0)
        return "Lowest grade range must start at 0";

    // If the highest grade range does not end at 100, return an error
    if (sorted[sorted.length - 1].maxScore !== 100)
        return "Highest grade range must end at 100";

    // If the grade ranges overlap, return an error
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].maxScore + 1 !== sorted[i + 1].minScore)
            return "Grade ranges must be contiguous — no gaps or overlaps";
    }

    return null;
}

// Returns true if [newMin, newMax] overlaps any existing entry (excluding skipIndex — used during edit)
function hasRangeOverlap(
    entries: GradingEntryValues[],
    newMin: number,
    newMax: number,
    skipIndex?: number,
): boolean {
    return entries.some((g, i) => {
        if (i === skipIndex) return false;
        return newMin <= g.maxScore && newMax >= g.minScore;
    });
}

type GradingSystemCardProps = {
    termId: string;
    canManage: boolean;
    onRetryAll: () => void;
};

export function GradingSystemCard({ termId, canManage, onRetryAll }: GradingSystemCardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { mutate } = useSWRConfig();

    const { data: gsData, error: gsError, isLoading: isLoadingGS } = getGradingSystem(termId);

    const gradingKey = termId
        ? `/api/v1/grading-system?termId=${encodeURIComponent(termId)}`
        : null;

    const criticalLoadError = termId ? gsError : undefined;
    const isComponentLoading = Boolean(termId) && isLoadingGS;

    useEffect(() => {
        if (!gsError) return;
        const status = getHttpStatus(gsError);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [gsError, router, pathname]);

    const { saveGradingSystem, isMutating: isSaving, error: saveGradingError } = useSaveGradingSystem();

    // Current local edit buffer — may diverge from server while user is staging changes
    const [gradings, setGradings] = useState<GradingEntryPayload[]>([]);

    // Last successfully persisted state — used to restore on discard
    const [savedGradings, setSavedGradings] = useState<GradingEntryPayload[]>([]);

    // Track if the grading system is dirty (has changes that need to be saved)
    const [gradingDirty, setGradingDirty] = useState(false);

    // Sync local buffer when the server data or termId changes
    useEffect(() => {
        // Map the server data to the local state
        const rows: GradingEntryPayload[] = (gsData ?? []).map((e: getSingleGradingEntry) => ({
            id: e.id ?? undefined,
            grade: e.grade,
            minScore: e.minScore,
            maxScore: e.maxScore,
            remark: e.remark ?? undefined,
        }));
        // state management
        setGradings(rows);
        setSavedGradings(rows);
        setGradingDirty(false);
    }, [termId, gsData]);

    // Add/edit dialog state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Derived: true when 0–100 is fully covered — disables the Add button
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

    // Open the add grading modal
    function openAddDialog() {
        if (!canManage) return;
        addForm.reset({ grade: "", minScore: 0, maxScore: 0 });
        setIsAddDialogOpen(true);
    }

    // Open the edit grading modal
    function openEditDialog(index: number) {
        if (!canManage) return;
        setEditingIndex(index);
        editForm.reset(gradings[index]);
        setIsEditDialogOpen(true);
    }

    // Add entry to local state — does NOT call the API (use Save Changes to persist)
    function addGrading(values: GradingEntryValues) {
        // If the range overlaps with an existing grade range, return an error
        if (hasRangeOverlap(gradings, values.minScore, values.maxScore)) {
            toast.error("This range overlaps with an existing grade range");
            return;
        }
        // Otherwise, add the new grade range to the local state
        setGradings((prev) => [...prev, { id: undefined, grade: values.grade, minScore: values.minScore, maxScore: values.maxScore, remark: undefined }]);
        // state management
        setGradingDirty(true);
        setIsAddDialogOpen(false);
        addForm.reset({ grade: "", minScore: 0, maxScore: 0 });
        toast.success(`Added grade "${values.grade}". Save Changes to persist.`);
    }

    // Update entry in local state — does NOT call the API
    function updateGrading(values: GradingEntryValues) {
        // If no grade is selected to update, return an error
        if (editingIndex === null) {
            toast.error("No grade selected to update");
            return;
        }
        // If the range overlaps with an existing grade range, return an error
        if (hasRangeOverlap(gradings, values.minScore, values.maxScore, editingIndex)) {
            toast.error("This range overlaps with an existing grade range");
            return;
        }
        // Otherwise, update the grade range in the local state
        setGradings((prev) => prev.map((g, i) => (i === editingIndex ? { id: g.id ?? undefined, grade: values.grade, minScore: values.minScore, maxScore: values.maxScore, remark: g.remark } : g)));
        setGradingDirty(true);
        setIsEditDialogOpen(false);
        setEditingIndex(null);
        toast.success(`Grade "${values.grade}" updated. Save Changes to persist.`);
    }

    // Delete entry from local state — does NOT call the API
    function deleteGrading(index: number) {
        if (!canManage) return;
        const label = gradings[index].grade;
        setGradings((prev) => prev.filter((_, i) => i !== index));
        // state management
        setGradingDirty(true);
        toast.success(`Deleted grade "${label}". Save Changes to persist.`);
    }

    // Discard all local changes — reset to the last successfully saved state
    function handleDiscard() {
        // Reset the local state to the last successfully saved state
        setGradings(savedGradings);
        // state management
        setGradingDirty(false);
    }

    // Save: validate full coverage, call POST /grading-system, update savedGradings
    async function handleSave() {
        if (!canManage) return;
        // If no term is selected, return an error
        if (!termId.trim()) {
            toast.error("No academic term selected. Please create a term first.");
            return;
        }
        // Validate the grading system coverage
        const error = validateGradingCoverage(gradings);
        if (error) {
            toast.error("Invalid grading system", { description: error });
            return;
        }
        // Try to save the grading system
        try {
            const response = await saveGradingSystem({
                termId,
                entries: gradings.map((g) => ({
                    // id is autogen by the database regardless of update or insert
                    grade: g.grade,
                    minScore: g.minScore,
                    maxScore: g.maxScore,
                    remark: g.remark,
                })),
            });
            if (response?.success) {
                setSavedGradings(gradings);
                setGradingDirty(false);
                if (gradingKey) void mutate(gradingKey);
                toast.success("Grading system saved successfully");
            }
        } catch (err) {
            const mutationErr = saveGradingError || err;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, "Failed to save grading system"));
            }
        }
    }

    // Display highest grade first (descending by minScore)
    const sortedWithIndex = gradings
        .map((entry, index) => ({ entry, index }))
        .sort((a, b) => b.entry.minScore - a.entry.minScore);

    const noTermWarning = !termId
        ? "Create a term first to enable saving the grading system."
        : null;

    return (
        <>
            {/* Add Grading Modal */}
            <AddGradingModal
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                form={addForm}
                onSubmit={addGrading}
                loading={addForm.formState.isSubmitting || isSaving}
            />

            {/* Edit Grading Modal */}
            <EditGradingModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                form={editForm}
                onSubmit={updateGrading}
                loading={editForm.formState.isSubmitting || isSaving}
            />

            <Card className="border shadow-md">
                <CardContent className="space-y-4">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base md:text-lg font-semibold text-foreground">Grading System</h4>
                            {/* Add Grading Button — disabled when 0–100 is fully covered or no term exists */}
                            {canManage && (
                                <Button
                                    type="button"
                                    onClick={openAddDialog}
                                    className="h-10 md:h-12 cursor-pointer"
                                    disabled={
                                        isFullyCovered
                                        || !termId
                                        || criticalLoadError !== undefined
                                        || isComponentLoading
                                        || isSaving
                                    }
                                >
                                    <Plus className="h-3 w-3" />
                                    Add Grading
                                </Button>
                            )}
                        </div>

                        <hr className="my-3" />

                        {criticalLoadError ? (
                            <ErrorBanner
                                title="Could not load grading system"
                                message={getApiErrorMessage(criticalLoadError, "Failed to load grading system. Please try again.")}
                                onRetry={onRetryAll}
                            />
                        ) : isComponentLoading ? (
                            <GradingTableSkeleton />
                        ) : (
                            <div className="space-y-2">
                                {noTermWarning && (
                                    <p className="text-xs text-muted-foreground pb-1">{noTermWarning}</p>
                                )}

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
                                            {canManage && <th className="py-2 w-[32%] md:w-[16%]"></th>}
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
                                                {canManage && (
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
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                                )}
                            </div>
                        )}

                        {canManage && !criticalLoadError && !isComponentLoading && (
                            <div className="flex justify-center gap-2 w-full mt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!gradingDirty || isSaving}
                                    onClick={handleDiscard}
                                    className="w-max h-10 md:h-12 cursor-pointer w-[50%] md:w-max"
                                >
                                    Discard Changes
                                </Button>
                                <LoadingButton
                                    type="button"
                                    loading={isSaving}
                                    disabled={!gradingDirty || isSaving || !termId}
                                    onClick={handleSave}
                                    className="w-max h-10 md:h-12 cursor-pointer w-[50%] md:w-max"
                                >
                                    Save Changes
                                </LoadingButton>
                            </div>
                        )}

                    </section>
                </CardContent>
            </Card>
        </>
    );
}
