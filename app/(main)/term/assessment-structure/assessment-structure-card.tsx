"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { LoadingButton } from "@/shared-components/loading-button";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { AddAssessmentModal } from "./add-assessment-modal";
import { EditAssessmentModal } from "./edit-assessment-modal";
import { AssessmentStructureTable } from "./assessment-structure-table";
import { getApiErrorMessage, getHttpStatus, useCreateAssessmentStructure, useUpdateAssessmentStructure } from "@/fetcher/mutations";
import { getAssessmentStructure } from "@/fetcher/queries";
import { assessmentStructureKey } from "@/fetcher/keys";
import type { createSingleAssessmentStructure, getSingleAssessmentStructure, updateSingleAssessmentStructure } from "@/types/term";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { AssessmentTableSkeleton } from "../term-loading-skeletons";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";

// Per-entry schema — used by both add and edit modals (id excluded: managed separately in state)
export const assessmentStructureEntrySchema = z.object({
    type: z.string().trim().min(1, { message: "Assessment type is required" }),
    percentage: z.number().min(1, "Minimum 1%").max(100, "Maximum 100"),
    displayOrder: z.number().int().min(1, { message: "Order must be a positive integer" }),
});
export type AssessmentStructureValues = z.infer<typeof assessmentStructureEntrySchema>;

// Local buffer entry: id is null for new (unsaved) entries, string for persisted ones
type BufferEntry = AssessmentStructureValues & { id: string | null };

// Validation: total must equal exactly 100% before saving
function validateAssessmentTotal(entries: AssessmentStructureValues[]): string | null {
    if (entries.length === 0) return "At least one assessment component is required";
    const total = entries.reduce((sum, e) => sum + e.percentage, 0);
    if (total < 100) return `Total is ${total}%. Add more components to reach 100%.`;
    if (total > 100) return `Total is ${total}%. Adjust percentages to equal exactly 100%.`;
    return null;
}

type AssessmentStructureCardProps = {
    termId: string;
    canManage: boolean;
    onRetryAll: () => void;
};

function mapAssessmentRows(data: getSingleAssessmentStructure[] | undefined): BufferEntry[] {
    return (data ?? []).map((entry) => ({
        id: entry.id,
        type: entry.type,
        percentage: entry.percentage,
        displayOrder: entry.displayOrder,
    }));
}

export function AssessmentStructureCard({ termId, canManage, onRetryAll }: AssessmentStructureCardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { mutate } = useSWRConfig();

    const { data: asData, isLoading: isLoadingAS, error: asError } = getAssessmentStructure(termId);

    // Skeleton only while the initial fetch for this term is in flight
    const isInitialLoading = Boolean(termId) && isLoadingAS && asData === null;

    useEffect(() => {
        if (!asError) return;
        const status = getHttpStatus(asError);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [asError, router, pathname]);

    const { trigger: createAS, isMutating: isCreating, error: createError } = useCreateAssessmentStructure();
    const { trigger: updateAS, isMutating: isUpdating, error: updateError } = useUpdateAssessmentStructure();
    const isSaving = isCreating || isUpdating;

    // Local edit buffer — diverges from SWR cache while the user is staging changes
    const [assessmentStructures, setAssessmentStructures] = useState<BufferEntry[]>([]);

    // Last persisted state — used to restore on discard
    const [savedAssessmentStructures, setSavedAssessmentStructures] = useState<BufferEntry[]>([]);

    // POST only when this term has no rows on the server; PATCH thereafter (new rows omit id)
    const hasServerStructure = Array.isArray(asData) && asData.length > 0;
    const [hasPersistedStructure, setHasPersistedStructure] = useState(false);
    const isFirstSave = !hasServerStructure && !hasPersistedStructure;

    const [assessmentStructureDirty, setAssessmentStructureDirty] = useState(false);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [assessmentToDelete, setAssessmentToDelete] = useState<number | null>(null);

    // Running total — disables Add button at 100%
    const assessmentStructureTotal = assessmentStructures.length > 0
        ? assessmentStructures.reduce((sum, e) => sum + e.percentage, 0)
        : 0;

    // Sync local buffer when the server data or termId changes
    useEffect(() => {
        const rows = mapAssessmentRows(asData as getSingleAssessmentStructure[] | undefined);
        setAssessmentStructures(rows);
        setSavedAssessmentStructures(rows);
        setAssessmentStructureDirty(false);
        setHasPersistedStructure(rows.length > 0);
    }, [termId, asData]);

    const addForm = useForm<AssessmentStructureValues>({
        resolver: zodResolver(assessmentStructureEntrySchema),
        defaultValues: { type: "", percentage: 1, displayOrder: 1 },
    });

    const editForm = useForm<AssessmentStructureValues>({
        resolver: zodResolver(assessmentStructureEntrySchema),
        defaultValues: { type: "", percentage: 1, displayOrder: 1 },
    });

    function openAddDialog() {
        if (!canManage) return;
        addForm.reset({ type: "", percentage: 1, displayOrder: assessmentStructures.length + 1 });
        setIsAddDialogOpen(true);
    }

    function openEditDialog(index: number) {
        if (!canManage) return;
        setEditingIndex(index);
        editForm.reset(assessmentStructures[index]);
        setIsEditDialogOpen(true);
    }

    // Add entry to local state — does NOT call the API (use Save Changes to persist)
    function addAssessmentStructure(values: AssessmentStructureValues) {
        if (assessmentStructures.some((a) => a.displayOrder === values.displayOrder)) {
            addForm.setError("displayOrder", { message: `Order ${values.displayOrder} is already used` });
            return;
        }
        if (assessmentStructureTotal + values.percentage > 100) {
            addForm.setError("percentage", {
                message: `Adding ${values.percentage}% would exceed 100% by ${values.percentage + assessmentStructureTotal - 100}%. Review assessment structure and try again`,
            });
            return;
        }
        setAssessmentStructures((prev) => [...prev, { ...values, id: null }]);
        setAssessmentStructureDirty(true);
        setIsAddDialogOpen(false);
        addForm.reset({ type: "", percentage: 1, displayOrder: 1 });
        toast.success(`Added "${values.type}". Save Changes to persist.`);
    }

    // Update entry in local state — does NOT call the API
    function updateAssessmentStructure(values: AssessmentStructureValues) {
        if (editingIndex === null) {
            toast.error("No assessment selected to update");
            return;
        }
        if (assessmentStructures.some((a, i) => i !== editingIndex && a.displayOrder === values.displayOrder)) {
            toast.error("Display order is already used");
            return;
        }
        const oldPercentage = assessmentStructures[editingIndex].percentage;
        const newTotal = assessmentStructureTotal - oldPercentage + values.percentage;
        if (newTotal > 100) {
            toast.error(`This would set total to ${newTotal}%. Max allowed: ${100 - assessmentStructureTotal + oldPercentage}%`);
            return;
        }
        const existingId = assessmentStructures[editingIndex].id;
        setAssessmentStructures((prev) =>
            prev.map((as, i) => (i === editingIndex ? { ...values, id: existingId } : as)),
        );
        setAssessmentStructureDirty(true);
        setIsEditDialogOpen(false);
        setEditingIndex(null);
        toast.success(`"${values.type}" updated. Save Changes to persist.`);
    }

    // Delete entry from local state — does NOT call the API (use Save Changes to persist)
    function deleteAssessment() {
        if (!canManage || assessmentToDelete === null) return;
        const label = assessmentStructures[assessmentToDelete].type;
        setAssessmentStructures((prev) => prev.filter((_, i) => i !== assessmentToDelete));
        setAssessmentStructureDirty(true);
        setAssessmentToDelete(null);
        toast.success(`Deleted "${label}". Save Changes to persist.`);
    }

    function handleDiscard() {
        setAssessmentStructures(savedAssessmentStructures);
        setAssessmentStructureDirty(false);
    }

    // Save: validate the full set, then POST (first save) or PATCH (updates)
    async function handleSave() {
        if (!canManage) return;
        if (!termId) {
            toast.error("No academic term selected. Please create a term first.");
            return;
        }

        const validationError = validateAssessmentTotal(assessmentStructures);
        if (validationError) {
            toast.error("Invalid assessment structure", { description: validationError });
            return;
        }

        try {
            const response = isFirstSave
                ? await createAS({
                    termId,
                    entries: assessmentStructures.map((e): createSingleAssessmentStructure => ({
                        type: e.type,
                        percentage: e.percentage,
                        displayOrder: e.displayOrder,
                    })),
                })
                : await updateAS({
                    termId,
                    entries: assessmentStructures.map((e): updateSingleAssessmentStructure => ({
                        ...(e.id ? { id: e.id } : {}),
                        type: e.type,
                        percentage: e.percentage,
                        displayOrder: e.displayOrder,
                    })),
                });

            if (response?.success) {
                setSavedAssessmentStructures(assessmentStructures);
                setAssessmentStructureDirty(false);
                setHasPersistedStructure(true);
                void mutate(assessmentStructureKey(termId));
                toast.success(`Assessment structure ${isFirstSave ? "created" : "updated"} successfully`);
            }
        } catch (err: unknown) {
            const mutationErr = createError || updateError || err;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, "Failed to save assessment structure"));
            }
        }
    }

    const showSaveActions = canManage && Boolean(termId) && !isInitialLoading && !asError;

    return (
        <>
            {/* Add assessment modal */}
            <AddAssessmentModal
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                form={addForm}
                onSubmit={addAssessmentStructure}
                loading={addForm.formState.isSubmitting || isSaving}
                remainingPercentage={100 - assessmentStructureTotal}
            />

            {/* Edit assessment modal */}
            <EditAssessmentModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                form={editForm}
                onSubmit={updateAssessmentStructure}
                loading={editForm.formState.isSubmitting || isSaving}
            />

            {/* Delete confirmation */}
            <ConfirmDialog
                open={assessmentToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) setAssessmentToDelete(null);
                }}
                title="Remove assessment?"
                description={
                    assessmentToDelete !== null
                        ? `Remove "${assessmentStructures[assessmentToDelete]?.type}" from the list? This is not saved until you click Save Changes.`
                        : "Remove this assessment from the list?"
                }
                confirmLabel="Remove"
                disabled={assessmentToDelete === null}
                onConfirm={deleteAssessment}
            />

            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">
                        {/* Assessment structure title and add button */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* Title and description */}
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-foreground md:text-lg">
                                    Assessment Structure ({assessmentStructures.length})
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Define assessment types and weightings for the active term.
                                </p>
                            </div>
                            {/* Add assessment button — disabled when total is 100% or no term exists */}
                            {canManage && (
                                <Button
                                    type="button"
                                    onClick={openAddDialog}
                                    className="h-10 cursor-pointer md:h-12"
                                    disabled={
                                        assessmentStructureTotal >= 100
                                        || !termId
                                        || !!asError
                                        || isInitialLoading
                                        || isSaving
                                    }
                                >
                                    Add Assessment
                                </Button>
                            )}
                        </div>

                        <hr className="my-3" />

                        {!termId ? (
                            // If there is no active term, assessment structure cannot be configured yet
                            <EmptyNoEntry
                                embedded
                                title="No active term"
                                description="Create or activate an academic term above to configure the assessment structure."
                            />
                        ) : isInitialLoading ? (
                            // If assessment data is loading and there is no cached data, show the skeleton
                            <AssessmentTableSkeleton />
                        ) : asError ? (
                            // If there is an error loading the assessment structure, show the error banner
                            <ErrorBanner
                                title="Could not load assessment structure"
                                message={getApiErrorMessage(asError, "Failed to load assessment structure. Please try again.")}
                                onRetry={onRetryAll}
                            />
                        ) : assessmentStructures.length === 0 ? (
                            // If there are no assessment entries after loading, show the empty no entry component
                            <EmptyNoEntry
                                embedded
                                title="No assessment structure yet"
                                description="Add assessment types and weightings for this term."
                                actionLabel={canManage ? "Add Assessment" : undefined}
                                onAction={canManage ? openAddDialog : undefined}
                            />
                        ) : (
                            <div className="space-y-2">
                                {/* Running total hint while percentages do not yet equal 100% */}
                                {assessmentStructureTotal !== 100 && (
                                    <p className="pb-1 text-xs text-destructive">
                                        {assessmentStructureTotal < 100
                                            ? `Total: ${assessmentStructureTotal}% — ${100 - assessmentStructureTotal}% remaining`
                                            : `Total: ${assessmentStructureTotal}% — exceeds 100%`}
                                    </p>
                                )}

                                {/* Finally, if there are assessment entries, show the assessment structure table */}
                                <div className="py-3">
                                    <AssessmentStructureTable
                                        entries={assessmentStructures}
                                        canManage={canManage}
                                        isSaving={isSaving}
                                        disabled={isSaving || !!asError}
                                        onEditAssessment={openEditDialog}
                                        onDeleteAssessment={setAssessmentToDelete}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Save / discard — only when term is selected and data has loaded */}
                        {showSaveActions && (
                            <div className="mt-2 flex w-full justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!assessmentStructureDirty || isSaving}
                                    onClick={handleDiscard}
                                    className="h-10 w-[50%] cursor-pointer md:h-12 md:w-max"
                                >
                                    Discard Changes
                                </Button>
                                <LoadingButton
                                    type="button"
                                    loading={isSaving}
                                    disabled={!assessmentStructureDirty || isSaving}
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