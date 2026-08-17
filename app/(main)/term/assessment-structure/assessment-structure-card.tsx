"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { LoadingButton } from "@/shared-components/loading-button";
import { ErrorBanner } from "@/shared-components/error-banner";
import { AddAssessmentModal } from "./add-assessment-modal";
import { EditAssessmentModal } from "./edit-assessment-modal";
import { getApiErrorMessage, getHttpStatus, useCreateAssessmentStructure, useUpdateAssessmentStructure } from "@/fetcher/mutations";
import { getAssessmentStructure } from "@/fetcher/queries";
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
// types (infer from the schema)
export type AssessmentStructureValues = z.infer<typeof assessmentStructureEntrySchema>;
// Local buffer entry: id is null for new (unsaved) entries, string for persisted ones
type BufferEntry = AssessmentStructureValues & { id: string | null };

// Validation: total must equal exactly 100% before saving. If return is not null, then error exists
function validateAssessmentTotal(entries: AssessmentStructureValues[]): string | null {
    // at least one assessment component is required
    if (entries.length === 0) return "At least one assessment component is required";
    // total must not be less than 100%
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

    const assessmentKey = termId
        ? `/api/v1/assessment-structure?termId=${encodeURIComponent(termId)}`
        : null;

    const criticalLoadError = termId ? asError : null;
    const isComponentLoading = Boolean(termId) && isLoadingAS;

    useEffect(() => {
        if (!asError) return;
        const status = getHttpStatus(asError);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [asError, router, pathname]);

    // SWR mutation: POST /assessment-structure
    const { trigger: createAS, isMutating: isCreating, error: createError } = useCreateAssessmentStructure();

    // SWR mutation: PATCH /assessment-structure/{termId}
    const { trigger: updateAS, isMutating: isUpdating, error: updateError } = useUpdateAssessmentStructure();

    // Local edit buffer — diverges from SWR cache while the user is staging changes.
    // id is null for new (unsaved) entries, string for persisted ones.
    const [assessmentStructures, setAssessmentStructures] = useState<BufferEntry[]>([]);

    // Last persisted state — derived directly from SWR cache, used to restore on discard
    const [savedAssessmentStructures, setSavedAssessmentStructures] = useState<BufferEntry[]>([]);
    // POST only when this term has no rows on the server; PATCH thereafter (new rows omit id)
    const hasServerStructure = Array.isArray(asData) && asData.length > 0;
    const [hasPersistedStructure, setHasPersistedStructure] = useState(false);
    const isFirstSave = !hasServerStructure && !hasPersistedStructure;

    // Flag to indicate if the assessment structure has been modified since the last save
    const [assessmentStructureDirty, setAssessmentStructureDirty] = useState(false);

    // Add/edit dialog state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [assessmentToDelete, setAssessmentToDelete] = useState<number | null>(null);

    // Derived: running total — disables Add button at 100%
    const assessmentStructureTotal = assessmentStructures.length > 0 ? assessmentStructures.reduce((sum, e) => sum + e.percentage, 0) : 0;

    // Update the assessment structures when the term id or fetched data changes
    useEffect(() => {
        const rows = mapAssessmentRows(asData as getSingleAssessmentStructure[] | undefined);
        setAssessmentStructures(rows);
        setSavedAssessmentStructures(rows);
        setAssessmentStructureDirty(false);
        setHasPersistedStructure(rows.length > 0);
    }, [termId, asData]);



    // Add assessment structure modal form
    const addForm = useForm<AssessmentStructureValues>({
        resolver: zodResolver(assessmentStructureEntrySchema),
        defaultValues: { type: "", percentage: 1, displayOrder: 1 },
    });

    // Edit assessment structure modal form
    const editForm = useForm<AssessmentStructureValues>({
        resolver: zodResolver(assessmentStructureEntrySchema),
        defaultValues: { type: "", percentage: 1, displayOrder: 1 },
    });

    // Open add dialog — pre-fill display order with next available slot
    function openAddDialog() {
        if (!canManage) return;
        addForm.reset({ type: "", percentage: 1, displayOrder: assessmentStructures.length + 1 });
        setIsAddDialogOpen(true);
    }

    // Open edit dialog — pre-fill form with the selected entry
    function openEditDialog(index: number) {
        if (!canManage) return;
        setEditingIndex(index);
        editForm.reset(assessmentStructures[index]);
        setIsEditDialogOpen(true);
    }

    // Add entry to local state — does NOT call the API yet (Called at once when local state is error-free) for save changes 
    function addAssessmentStructure(values: AssessmentStructureValues) {
        // Duplicate order check
        if (assessmentStructures.some((a) => a.displayOrder === values.displayOrder)) {
            addForm.setError("displayOrder", { message: `Order ${values.displayOrder} is already used` });
            return;
        }
        // Overflow check
        if (assessmentStructureTotal + values.percentage > 100) {
            addForm.setError("percentage", {
                message: `Adding ${values.percentage}% would exceed 100% by ${values.percentage + assessmentStructureTotal - 100}%. Review assessment structure and try again`,
            });
            return;
        }
        // New entries have no id — the server assigns one on save
        setAssessmentStructures((prev) => [...prev, { ...values, id: null }]);
        setAssessmentStructureDirty(true); // Flag to indicate that the assessment structure has been modified since the last save
        // close dialog + reset add form
        setIsAddDialogOpen(false);
        addForm.reset({ type: "", percentage: 1, displayOrder: 1 });
        // show success toast
        toast.success(`Added "${values.type}". Save Changes to persist.`);
    }

    // Update entry in local state — does NOT call the API yet
    function updateAssessmentStructure(values: AssessmentStructureValues) {
        // check if an assessment is selected to update
        if (editingIndex === null) {
            toast.error("No assessment selected to update");
            return;
        }
        // Duplicate order check (exclude current entry)
        if (assessmentStructures.some((a, i) => i !== editingIndex && a.displayOrder === values.displayOrder)) {
            toast.error("Display order is already used");
            return;
        }
        // Overflow check (subtract old percentage before testing new one)
        const oldPercentage = assessmentStructures[editingIndex].percentage;
        const newTotal = assessmentStructureTotal - oldPercentage + values.percentage;
        if (newTotal > 100) {
            toast.error(`This would set total to ${newTotal}%. Max allowed: ${100 - assessmentStructureTotal + oldPercentage}%`);
            return;
        }
        // Preserve the existing id if it has one (needed for server-side in-place update)
        const existingId = assessmentStructures[editingIndex].id;
        // update the local state
        setAssessmentStructures((prev) =>
            prev.map((as, i) => (i === editingIndex ? { ...values, id: existingId } : as))
        );
        // close dialog + resets
        setAssessmentStructureDirty(true);
        setIsEditDialogOpen(false);
        setEditingIndex(null);
        // show success toast
        toast.success(`"${values.type}" updated. Save Changes to persist.`);
    }

    // Delete entry from local state — does NOT call the API yet (use Save Changes to persist)
    function deleteAssessment() {
        if (!canManage || assessmentToDelete === null) return;
        const label = assessmentStructures[assessmentToDelete].type;
        setAssessmentStructures((prev) => prev.filter((_, i) => i !== assessmentToDelete));
        setAssessmentStructureDirty(true);
        setAssessmentToDelete(null);
        toast.success(`Deleted "${label}". Save Changes to persist.`);
    }

    // Discard all local changes — reset to the last successfully saved state
    function handleDiscard() {
        // reset the local state to the last successfully saved state
        setAssessmentStructures(savedAssessmentStructures);
        // reset the dirty flag
        setAssessmentStructureDirty(false);
    }

    // Save: validate the full set, call POST /assessment-structure, update savedAssessments with IDs
    async function handleSave() {
        if (!canManage) return;
        // If there is no term selected, show error and return
        if (!termId) {
            toast.error("No academic term selected. Please create a term first.");
            return;
        }

        // ensure no errors in the local state (beyond zod schema validation errors)
        const validationError = validateAssessmentTotal(assessmentStructures);
        if (validationError) {
            toast.error("Invalid assessment structure", { description: validationError });
            return;
        }

        // if it is the first save, create the assessment structure, otherwise update it
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
                if (assessmentKey) void mutate(assessmentKey);
                toast.success(`Assessment structure ${isFirstSave ? "created" : "updated"} successfully`);
            }
        } catch (err: unknown) {
            const mutationErr = createError || updateError || err;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, "Failed to save assessment structure"));
            }
        }
    }

    // Sort by ascending order for display order
    const sortedWithIndex = assessmentStructures.length > 0 ? assessmentStructures
        .map((entry, index) => ({ entry, index }))
        .sort((a, b) => a.entry.displayOrder - b.entry.displayOrder) : [];

    // Disable add assessment unless a term exists
    const noTermWarning = !termId
        ? "Create a term first to enable saving the assessment structure."
        : null;

    return (
        <>
            {/* Add Assessment Modal */}
            <AddAssessmentModal
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                form={addForm}
                onSubmit={addAssessmentStructure}
                loading={addForm.formState.isSubmitting || isCreating || isUpdating}
                remainingPercentage={100 - assessmentStructureTotal}
            />

            {/* Edit Assessment Modal */}
            <EditAssessmentModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                form={editForm}
                onSubmit={updateAssessmentStructure}
                loading={editForm.formState.isSubmitting || isCreating || isUpdating}
            />

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
                <CardContent className="space-y-4">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base md:text-lg font-semibold text-foreground">Assessment Structure</h4>
                            {/* Add Assessment Button — disabled when total is 100% or no term exists */}
                            {canManage && (
                                <Button
                                    type="button"
                                    onClick={openAddDialog}
                                    className="h-10 md:h-12 cursor-pointer"
                                    disabled={
                                        assessmentStructureTotal >= 100
                                        || !termId
                                        || criticalLoadError !== null
                                        || isComponentLoading
                                        || isCreating
                                        || isUpdating
                                    }
                                >
                                    Add Assessment
                                </Button>
                            )}
                        </div>

                        <hr className="my-3" />

                        {criticalLoadError ? (
                            <ErrorBanner
                                title="Could not load assessment structure"
                                message={getApiErrorMessage(criticalLoadError, "Failed to load assessment structure. Please try again.")}
                                onRetry={onRetryAll}
                            />
                        ) : isComponentLoading ? (
                            <AssessmentTableSkeleton />
                        ) : (
                            <div className="space-y-2">
                                {noTermWarning && (
                                    <p className="text-xs text-muted-foreground pb-1">{noTermWarning}</p>
                                )}

                                {assessmentStructures.length > 0 && assessmentStructureTotal !== 100 && (
                                    <p className="text-xs text-destructive pb-1">
                                        {assessmentStructureTotal < 100
                                            ? `Total: ${assessmentStructureTotal}% — ${100 - assessmentStructureTotal}% remaining`
                                            : `Total: ${assessmentStructureTotal}% — exceeds 100%`}
                                    </p>
                                )}

                                {assessmentStructures.length === 0 ? (
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
                                                <td className="py-2 pr-2 truncate">#{entry.displayOrder}</td>
                                                <td className="py-2">
                                                    {canManage && (
                                                        <div className="flex items-center justify-end gap-1">
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
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => setAssessmentToDelete(index)}
                                                                className="cursor-pointer border border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300 text-sm md:text-base"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                <span className="hidden sm:inline">Delete</span>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
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
                                    disabled={!assessmentStructureDirty || isCreating || isUpdating}
                                    onClick={handleDiscard}
                                    className="w-max h-10 md:h-12 cursor-pointer w-[50%] md:w-max"
                                >
                                    Discard Changes
                                </Button>
                                <LoadingButton
                                    type="button"
                                    loading={isCreating || isUpdating}
                                    disabled={!assessmentStructureDirty || isCreating || isUpdating || !termId}
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
