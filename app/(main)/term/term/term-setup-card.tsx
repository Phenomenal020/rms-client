"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import SmallTermText from "@/shared-components/small-term-text";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { AddTermModal } from "./add-term-modal";
import { EditTermModal } from "./edit-term-modal";
import { TermSetupTable } from "./term-setup-table";
import { TERM_LABELS } from "./term-labels";
import { useCreateTerm, useUpdateTerm, useDeleteTerm, getApiErrorMessage } from "@/fetcher/mutations";
import { TERMS_KEY } from "@/fetcher/keys";
import type { singleTermPayload } from "@/types/term";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { TermSetupTableSkeleton } from "../term-loading-skeletons";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";

// Academic session options for the add-term dropdown (2025/2026 … 2035/2036)
export const ACADEMIC_YEAR_OPTIONS = [
    "2025/2026",
    "2026/2027",
    "2027/2028",
    "2028/2029",
    "2029/2030",
    "2030/2031",
    "2031/2032",
    "2032/2033",
    "2033/2034",
    "2034/2035",
    "2035/2036",
] as const;

// Schema for adding a term
export const addTermSchema = z.object({
    term: z.enum(["FIRST", "SECOND", "THIRD"], { error: "Term is required" }),
    academicYear: z.enum(ACADEMIC_YEAR_OPTIONS, { error: "Academic year is required" }),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    termDays: z.number().int().min(1).optional(),
});

// Schema for editing a term (dates + days only; term/year are immutable)
export const editTermSchema = z.object({
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
    termDays: z.number().int().min(1).optional().nullable(),
    status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"], { error: "Status is required" }),
});

export type AddTermValues = z.infer<typeof addTermSchema>;
export type EditTermValues = z.infer<typeof editTermSchema>;

type TermSetupCardProps = {
    terms: singleTermPayload[];
    activeTerm: singleTermPayload | null;
    canManage: boolean;
    termsError?: unknown;
    isLoadingTerms: boolean;
    onRetry: () => void;
};

export function TermSetupCard({
    terms,
    activeTerm,
    canManage,
    termsError,
    isLoadingTerms,
    onRetry,
}: TermSetupCardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { mutate } = useSWRConfig();

    // Add/edit/delete dialog state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [termToDelete, setTermToDelete] = useState<singleTermPayload | null>(null);

    // Track term being edited (defaults to active term on first mount)
    const [editedTerm, setEditedTerm] = useState<singleTermPayload | null>(activeTerm);

    // SWR mutations: create term (POST /terms), update term (PATCH /terms/:id), delete term (DELETE /terms/:id)
    const { trigger: createTerm, isMutating: isCreating } = useCreateTerm();
    const { trigger: updateTerm, isMutating: isUpdating } = useUpdateTerm();
    const { trigger: deleteTerm, isMutating: isDeleting } = useDeleteTerm();
    const isMutating = isCreating || isUpdating || isDeleting;

    const addForm = useForm<AddTermValues>({
        resolver: zodResolver(addTermSchema),
        defaultValues: {
            term: undefined,
            academicYear: undefined,
            termDays: undefined,
            startDate: undefined,
            endDate: undefined,
        },
    });

    const editForm = useForm<EditTermValues>({
        resolver: zodResolver(editTermSchema),
        defaultValues: {
            startDate: undefined,
            endDate: undefined,
            termDays: undefined,
            status: undefined,
        },
    });

    function openAddDialog() {
        if (!canManage) return;
        addForm.reset();
        setIsAddDialogOpen(true);
    }

    // Open editor for a specific row (draft / active / archived)
    function openEditDialog(row: singleTermPayload) {
        if (!canManage) return;
        setEditedTerm(row);
        editForm.reset({
            startDate: row.termStart ? new Date(row.termStart) : undefined,
            endDate: row.termEnd ? new Date(row.termEnd) : undefined,
            termDays: row.termDays ?? undefined,
            status: row.status,
        });
        setIsEditDialogOpen(true);
    }

    // Create a new term
    async function handleAddTerm(values: AddTermValues) {
        if (!canManage) return;
        try {
            await createTerm({
                term: values.term,
                academicYear: values.academicYear,
                termDays: values.termDays,
                termStart: values.startDate?.toISOString() ?? undefined,
                termEnd: values.endDate?.toISOString() ?? undefined,
            });
            void mutate(TERMS_KEY);
            setIsAddDialogOpen(false);
            addForm.reset();
            toast.success(`Added "${TERM_LABELS[values.term]}"`);
        } catch (err) {
            if (!handleAuthRedirect(err, { router, pathname })) {
                toast.error(getApiErrorMessage(err, `Failed to add "${TERM_LABELS[values.term]}" term`));
            }
        }
    }

    // Calls PATCH /term — term.id identifies the row; only mutable fields are sent.
    // On success, useUpdateTerm invalidates TERMS_KEY so SWR refetches and the table updates.
    async function handleUpdateTerm(values: EditTermValues) {
        if (!canManage) return;
        const termId = editedTerm?.id;
        if (!termId) return;
        try {
            await updateTerm({
                id: termId,
                status: values.status,
                termDays: values.termDays ?? undefined,
                termStart: values.startDate?.toISOString() ?? undefined,
                termEnd: values.endDate?.toISOString() ?? undefined,
            });
            setIsEditDialogOpen(false);
            editForm.reset(values);
            toast.success(`Updated "${TERM_LABELS[editedTerm?.term ?? "FIRST"]} term"`);
        } catch (err) {
            if (!handleAuthRedirect(err, { router, pathname })) {
                toast.error(getApiErrorMessage(err, `Failed to update "${TERM_LABELS[editedTerm?.term ?? "FIRST"]}" term`));
            }
        }
    }

    async function handleDeleteTerm() {
        if (!canManage || !termToDelete?.id) return;
        const label = TERM_LABELS[termToDelete.term];
        try {
            await deleteTerm({ id: termToDelete.id });
            setTermToDelete(null);
            toast.success(`Deleted "${label}" term`);
        } catch (err) {
            if (!handleAuthRedirect(err, { router, pathname })) {
                toast.error(getApiErrorMessage(err, `Failed to delete "${label}" term`));
            }
        }
    }

    return (
        <>
            <section className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Term Setup</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Add term modal */}
            <AddTermModal
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                form={addForm}
                onSubmit={handleAddTerm}
                loading={isMutating}
            />

            {/* Edit term modal */}
            <EditTermModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                form={editForm}
                onSubmit={handleUpdateTerm}
                loading={isMutating}
                term={editedTerm}
            />

            {/* Delete confirmation */}
            <ConfirmDialog
                open={termToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setTermToDelete(null);
                }}
                title="Delete term?"
                description={
                    termToDelete
                        ? `Delete "${TERM_LABELS[termToDelete.term]}" (${termToDelete.academicYear})? This cannot be undone. Terms with a grading system, assessment structure, class assignments, or enrollments cannot be deleted until those are removed.`
                        : "Delete this term? This cannot be undone."
                }
                confirmLabel="Delete Term"
                loading={isDeleting}
                disabled={!termToDelete}
                onConfirm={handleDeleteTerm}
            />

            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">
                        {/* Term title and add button */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* Title and description */}
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-foreground md:text-lg">
                                    Term ({terms.length})
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Create and manage academic terms for your school.
                                </p>
                            </div>
                            {/* Add term button */}
                            {canManage && (
                                <Button
                                    type="button"
                                    onClick={openAddDialog}
                                    className="h-10 cursor-pointer md:h-12"
                                    disabled={isMutating || !!termsError || (isLoadingTerms && terms.length === 0)}
                                >
                                    <Plus className="h-3 w-3" />
                                    Add Term
                                </Button>
                            )}
                        </div>

                        <hr className="my-3" />

                        {/* If terms are loading and there is no cached data, show the skeleton */}
                        {isLoadingTerms && terms.length === 0 ? (
                            <TermSetupTableSkeleton />
                        ) : termsError ? (
                            // If there is an error loading terms, show the error banner
                            <ErrorBanner
                                title="Could not load terms"
                                message={getApiErrorMessage(termsError, "Failed to load terms. Please try again.")}
                                onRetry={onRetry}
                            />
                        ) : terms.length === 0 ? (
                            // If there are no terms after loading, show the empty no entry component
                            <EmptyNoEntry
                                embedded
                                title="No term created"
                                description="Add an academic term to start managing sessions, assessments, and grading."
                                actionLabel={canManage ? "Add Term" : undefined}
                                onAction={canManage ? openAddDialog : undefined}
                            />
                        ) : (
                            // Finally, if there are terms, show the term setup table
                            <div className="py-3">
                                <TermSetupTable
                                    terms={terms}
                                    canManage={canManage}
                                    isMutating={isMutating}
                                    disabled={isMutating || !!termsError}
                                    onEditTerm={openEditDialog}
                                    onDeleteTerm={setTermToDelete}
                                />
                            </div>
                        )}
                    </section>
                </CardContent>
            </Card>
        </>
    );
}
