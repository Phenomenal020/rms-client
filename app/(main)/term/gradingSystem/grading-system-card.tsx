"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { LoadingButton } from "@/shared-components/loading-button";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { AddGradingModal } from "./add-grading-modal";
import { EditGradingModal } from "./edit-grading-modal";
import { GradingSystemTable } from "./grading-system-table";
import { useSaveGradingSystem, getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { getGradingSystem } from "@/fetcher/queries";
import { gradingSystemKey } from "@/fetcher/keys";
import type { getSingleGradingEntry, GradingEntryPayload } from "@/types/term";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { GradingTableSkeleton } from "../term-loading-skeletons";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";

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

// Custom validation: checks that the full grading array covers exactly 0–100 with no gaps or overlaps
function validateGradingCoverage(entries: GradingEntryValues[]): string | null {
    if (entries.length === 0) return "At least one grade entry is required";

    const seenGrades = new Set<string>();
    for (const entry of entries) {
        const normalised = entry.grade.toLowerCase();
        if (seenGrades.has(normalised)) {
            return `Grade label "${entry.grade}" is already used. Labels must be unique (case-insensitive).`;
        }
        seenGrades.add(normalised);
    }

    const sorted = [...entries].sort((a, b) => a.minScore - b.minScore);

    if (sorted[0].minScore !== 0) {
        return "Lowest grade range must start at 0";
    }

    if (sorted[sorted.length - 1].maxScore !== 100) {
        return "Highest grade range must end at 100";
    }

    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].maxScore + 1 !== sorted[i + 1].minScore) {
            return "Grade ranges must be contiguous — no gaps or overlaps";
        }
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

function hasDuplicateGrade(entries: GradingEntryValues[], grade: string): boolean {
    const normalised = grade.toLowerCase();
    return entries.some((g) => g.grade.toLowerCase() === normalised);
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

    // Skeleton only while the initial fetch for this term is in flight
    const isInitialLoading = Boolean(termId) && isLoadingGS && gsData === null;

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
        const rows: GradingEntryPayload[] = (gsData ?? []).map((e: getSingleGradingEntry) => ({
            id: e.id ?? undefined,
            grade: e.grade,
            minScore: e.minScore,
            maxScore: e.maxScore,
            remark: e.remark ?? undefined,
        }));
        setGradings(rows);
        setSavedGradings(rows);
        setGradingDirty(false);
    }, [termId, gsData]);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [gradingToDelete, setGradingToDelete] = useState<number | null>(null);

    // True when 0–100 is fully covered — disables the Add button
    const isFullyCovered = validateGradingCoverage(gradings) === null;

    const addForm = useForm<GradingEntryValues>({
        resolver: zodResolver(gradingEntrySchema),
        defaultValues: { grade: "", minScore: 0, maxScore: 0 },
    });

    const editForm = useForm<GradingEntryValues>({
        resolver: zodResolver(gradingEntrySchema),
        defaultValues: { grade: "", minScore: 0, maxScore: 0 },
    });

    function openAddDialog() {
        if (!canManage) return;
        addForm.reset({ grade: "", minScore: 0, maxScore: 0 });
        setIsAddDialogOpen(true);
    }

    function openEditDialog(index: number) {
        if (!canManage) return;
        setEditingIndex(index);
        editForm.reset(gradings[index]);
        setIsEditDialogOpen(true);
    }

    // Add entry to local state — does NOT call the API (use Save Changes to persist)
    function addGrading(values: GradingEntryValues) {
        if (hasDuplicateGrade(gradings, values.grade)) {
            addForm.setError("grade", { message: `Grade "${values.grade}" is already used` });
            return;
        }
        if (hasRangeOverlap(gradings, values.minScore, values.maxScore)) {
            toast.error("This range overlaps with an existing grade range");
            return;
        }
        setGradings((prev) => [
            ...prev,
            { id: undefined, grade: values.grade, minScore: values.minScore, maxScore: values.maxScore, remark: undefined },
        ]);
        setGradingDirty(true);
        setIsAddDialogOpen(false);
        addForm.reset({ grade: "", minScore: 0, maxScore: 0 });
        toast.success(`Added grade "${values.grade}". Save Changes to persist.`);
    }

    // Update entry in local state — does NOT call the API
    function updateGrading(values: GradingEntryValues) {
        if (editingIndex === null) {
            toast.error("No grade selected to update");
            return;
        }
        if (hasDuplicateGrade(gradings, values.grade)) {
            toast.error(`Grade "${values.grade}" is already used`);
            return;
        }
        if (hasRangeOverlap(gradings, values.minScore, values.maxScore, editingIndex)) {
            toast.error("This range overlaps with an existing grade range");
            return;
        }
        setGradings((prev) =>
            prev.map((g, i) =>
                i === editingIndex
                    ? { id: g.id ?? undefined, grade: values.grade, minScore: values.minScore, maxScore: values.maxScore, remark: g.remark }
                    : g,
            ),
        );
        setGradingDirty(true);
        setIsEditDialogOpen(false);
        setEditingIndex(null);
        toast.success(`Grade "${values.grade}" updated. Save Changes to persist.`);
    }

    // Delete entry from local state — does NOT call the API (use Save Changes to persist)
    function deleteGrading() {
        if (!canManage || gradingToDelete === null) return;
        const label = gradings[gradingToDelete].grade;
        setGradings((prev) => prev.filter((_, i) => i !== gradingToDelete));
        setGradingDirty(true);
        setGradingToDelete(null);
        toast.success(`Deleted grade "${label}". Save Changes to persist.`);
    }

    // Discard all local changes — reset to the last successfully saved state
    function handleDiscard() {
        setGradings(savedGradings);
        setGradingDirty(false);
    }

    // Save: validate full coverage, call POST /grading-system, update savedGradings
    async function handleSave() {
        if (!canManage) return;
        if (!termId.trim()) {
            toast.error("No academic term selected. Please create a term first.");
            return;
        }
        const error = validateGradingCoverage(gradings);
        if (error) {
            toast.error("Invalid grading system", { description: error });
            return;
        }
        try {
            const response = await saveGradingSystem({
                termId,
                entries: gradings.map((g) => ({
                    grade: g.grade,
                    minScore: g.minScore,
                    maxScore: g.maxScore,
                    remark: g.remark,
                })),
            });
            if (response?.success) {
                setSavedGradings(gradings);
                setGradingDirty(false);
                void mutate(gradingSystemKey(termId));
                toast.success("Grading system saved successfully");
            }
        } catch (err) {
            const mutationErr = saveGradingError || err;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, "Failed to save grading system"));
            }
        }
    }

    const showSaveActions = canManage && Boolean(termId) && !isInitialLoading && !gsError;

    return (
        <>
            {/* Add grading modal */}
            <AddGradingModal
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                form={addForm}
                onSubmit={addGrading}
                loading={addForm.formState.isSubmitting || isSaving}
            />

            {/* Edit grading modal */}
            <EditGradingModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                form={editForm}
                onSubmit={updateGrading}
                loading={editForm.formState.isSubmitting || isSaving}
            />

            {/* Delete confirmation */}
            <ConfirmDialog
                open={gradingToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) setGradingToDelete(null);
                }}
                title="Remove grade?"
                description={
                    gradingToDelete !== null
                        ? `Remove "${gradings[gradingToDelete]?.grade}" from the list? This is not saved until you click Save Changes.`
                        : "Remove this grade from the list?"
                }
                confirmLabel="Remove"
                disabled={gradingToDelete === null}
                onConfirm={deleteGrading}
            />

            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">
                        {/* Grading system title and add button */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* Title and description */}
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-foreground md:text-lg">
                                    Grading System ({gradings.length})
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Define grade boundaries and score ranges for the active term.
                                </p>
                            </div>
                            {/* Add grading button — disabled when 0–100 is fully covered or no term exists */}
                            {canManage && (
                                <Button
                                    type="button"
                                    onClick={openAddDialog}
                                    className="h-10 cursor-pointer md:h-12"
                                    disabled={
                                        isFullyCovered
                                        || !termId
                                        || !!gsError
                                        || isInitialLoading
                                        || isSaving
                                    }
                                >
                                    <Plus className="h-3 w-3" />
                                    Add Grading
                                </Button>
                            )}
                        </div>

                        <hr className="my-3" />

                        {!termId ? (
                            // If there is no active term, grading cannot be configured yet
                            <EmptyNoEntry
                                embedded
                                title="No active term"
                                description="Create or activate an academic term above to configure the grading system."
                            />
                        ) : isInitialLoading ? (
                            // If grading data is loading and there is no cached data, show the skeleton
                            <GradingTableSkeleton />
                        ) : gsError ? (
                            // If there is an error loading the grading system, show the error banner
                            <ErrorBanner
                                title="Could not load grading system"
                                message={getApiErrorMessage(gsError, "Failed to load grading system. Please try again.")}
                                onRetry={onRetryAll}
                            />
                        ) : gradings.length === 0 ? (
                            // If there are no grade entries after loading, show the empty no entry component
                            <EmptyNoEntry
                                embedded
                                title="No grading system yet"
                                description="Define grade boundaries and score ranges for this term."
                                actionLabel={canManage ? "Add Grading" : undefined}
                                onAction={canManage ? openAddDialog : undefined}
                            />
                        ) : (
                            // Finally, if there are grade entries, show the grading system table
                            <div className="py-3">
                                <GradingSystemTable
                                    gradings={gradings}
                                    canManage={canManage}
                                    isSaving={isSaving}
                                    disabled={isSaving || !!gsError}
                                    onEditGrading={openEditDialog}
                                    onDeleteGrading={setGradingToDelete}
                                />
                            </div>
                        )}

                        {/* Save / discard — only when term is selected and data has loaded */}
                        {showSaveActions && (
                            <div className="mt-2 flex w-full justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!gradingDirty || isSaving}
                                    onClick={handleDiscard}
                                    className="h-10 w-[50%] cursor-pointer md:h-12 md:w-max"
                                >
                                    Discard Changes
                                </Button>
                                <LoadingButton
                                    type="button"
                                    loading={isSaving}
                                    disabled={!gradingDirty || isSaving}
                                    onClick={handleSave}
                                    className="h-10 w-[50%] cursor-pointer md:h-12 md:w-max"
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
