"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Pencil } from "lucide-react";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import SmallTermText from "@/shared-components/small-term-text";
import { ErrorBanner } from "@/shared-components/error-banner";
import { AddTermModal } from "./add-term-modal";
import { EditTermModal } from "./edit-term-modal";
import { useCreateTerm, useUpdateTerm, getApiErrorMessage } from "@/fetcher/mutations";
import type { singleTermPayload } from "@/types/term";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { TermSetupTableSkeleton } from "../term-loading-skeletons";

// Academic session options for the add-term dropdown (2023/2024 … 2035/2036)
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
// Types inferred from schemas
export type AddTermValues = z.infer<typeof addTermSchema>;
export type EditTermValues = z.infer<typeof editTermSchema>;

// Display labels for the term enum
const TERM_LABELS: Record<"FIRST" | "SECOND" | "THIRD", string> = {
    FIRST: "First",
    SECOND: "Second",
    THIRD: "Third",
};
type TermSetupCardProps = {
    terms: singleTermPayload[] | null;
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
    // hooks for redirection
    const router = useRouter();
    const pathname = usePathname();
    // manually invalidate cache
    const { mutate } = useSWRConfig();

    // error state and show term count
    const loadError = termsError;
    const showTermCount = !termsError && terms !== undefined;

    // Add/edit modal open state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Track term being edited (default is active term)
    const [editedTerm, setEditedTerm] = useState<singleTermPayload | null>(activeTerm);

    // SWR mutations: create term (POST /term) and update term (PATCH /term)
    const { trigger: createTerm, isMutating: isCreating, error: createTermError } = useCreateTerm();
    const { trigger: updateTerm, isMutating: isUpdating, error: updateTermError } = useUpdateTerm();
    const isMutating = isCreating || isUpdating;

    // Add form: Empty at first
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

    // edit form: Empty at first 'cept for term (name) and academic year
    const editForm = useForm<EditTermValues>({
        resolver: zodResolver(editTermSchema),
        defaultValues: {
            startDate: undefined,
            endDate: undefined,
            termDays: undefined,
            status: undefined,
        },
    });

    // Onclick add term button, reset the add form and open the add dialog
    function openAddDialog() {
        if (!canManage) return;  // if the user is not an orgadmin, return
        addForm.reset();
        setIsAddDialogOpen(true);
    }

    // Open editor for a specific row (draft / active / archived)
    function openEditDialog(row: singleTermPayload) {
        if (!canManage) return;  // orgadmin gate
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
        if (!canManage) return;  // orgadmin gate
        try {
            // construct the payload and make the API call (status is set to DRAFT by default)
            await createTerm({
                term: values.term,
                academicYear: values.academicYear,
                termDays: values.termDays,
                termStart: values.startDate?.toISOString() ?? undefined,
                termEnd: values.endDate?.toISOString() ?? undefined,
            });
            // Hook invalidates /api/v1/term; list fetch uses /api/v1/terms
            void mutate("/api/v1/terms");
            setIsAddDialogOpen(false);
            addForm.reset();
            // show a success toast
            toast.success(`Added "${TERM_LABELS[values.term]}"`);
        } catch (err) {
            const mutationErr = createTermError || err;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, `Failed to add "${TERM_LABELS[values.term]}" term`));
            }
        }
    }

    // Calls PATCH /term — term.id identifies the row; only mutable fields are sent.
    // On success, useUpdateTerm invalidates '/api/v1/term' so SWR refetches and the
    // table row updates without any local state management.
    async function handleUpdateTerm(values: EditTermValues) {
        if (!canManage) return;  // orgadmin gate
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
            // close the dialog and sync form state to what we just saved (avoids stale defaultValues from first mount)
            setIsEditDialogOpen(false);
            editForm.reset(values);
            // show a success toast
            toast.success(`Updated "${TERM_LABELS[editedTerm?.term ?? "FIRST"]} term"`);
        } catch (err) {
            const mutationErr = updateTermError || err;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, `Failed to update "${TERM_LABELS[editedTerm?.term ?? "FIRST"]}" term`));
            }
        }
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

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Add Term Modal */}
            <AddTermModal
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                form={addForm}
                onSubmit={handleAddTerm}
                loading={isMutating}
            />

            {/* Edit Term Modal */}
            <EditTermModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                form={editForm}
                onSubmit={handleUpdateTerm}
                loading={isMutating}
                term={editedTerm}
            />

            {/* Term Setup Card */}
            <Card className="border shadow-md">
                <CardContent className="space-y-4">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base md:text-lg font-semibold text-foreground">
                                Term{showTermCount ? ` (${terms?.length ?? 0})` : ""}
                            </h4>
                            {canManage && (
                                <Button
                                    type="button"
                                    onClick={openAddDialog}
                                    className="h-10 md:h-12 cursor-pointer"
                                    disabled={isMutating || loadError !== undefined || isLoadingTerms}
                                >
                                    <Plus className="h-3 w-3" />
                                    Add Term
                                </Button>
                            )}
                        </div>

                        <hr className="my-3" />

                        {loadError ? (
                            <ErrorBanner
                                title="Could not load terms"
                                message={getApiErrorMessage(loadError, "Failed to load terms. Please try again.")}
                                onRetry={onRetry}
                            />
                        ) : isLoadingTerms ? (
                            <TermSetupTableSkeleton />
                        ) : !terms || terms.length === 0 ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center my-3">
                                <p className="text-base font-medium text-muted-foreground">
                                    No Term Created. Please add a term to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto py-3">
                                <table className="min-w-[480px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border cursor-pointer">
                                            <th className="py-2 pr-1 w-[20%] md:w-[18%] font-semibold text-muted-foreground">Session</th>
                                            <th className="py-2 pr-1 w-[20%] md:w-[18%] font-semibold text-muted-foreground">Term</th>
                                            <th className="py-2 pr-1 w-[20%] md:w-[18%] font-semibold text-muted-foreground">Start Date</th>
                                            <th className="py-2 pr-1 w-[20%] md:w-[18%] font-semibold text-muted-foreground">End Date</th>
                                            <th className="py-2 pr-1 w-[10%] md:w-[18%] font-semibold text-muted-foreground">Days</th>
                                            {canManage && <th className="py-2 w-[10%] md:w-[10%]"></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {terms.map((term) => (
                                            <tr
                                                key={term.id}
                                                className={`border-b border-border last:border-b-0 transition-colors hover:bg-muted/40 ${term.status === 'ACTIVE' ? 'bg-green-500/5' : ''}`}
                                            >
                                                <td className={`py-2 pr-1 font-medium truncate ${term.status === 'ACTIVE' ? 'border-l-2 border-green-500 pl-2' : 'pl-0'}`}>{term.academicYear}</td>
                                                <td className="py-2 pr-1 font-medium truncate">
                                                    <span>{TERM_LABELS[term.term]}</span>
                                                    {term.status === 'ACTIVE' && (
                                                        <span className="ml-2 inline-flex items-center rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2 pr-1 text-muted-foreground truncate">
                                                    {term.termStart ? format(new Date(term.termStart), "MMM d, yyyy") : "—"}
                                                </td>
                                                <td className="py-2 pr-1 text-muted-foreground truncate">
                                                    {term.termEnd ? format(new Date(term.termEnd), "MMM d, yyyy") : "—"}
                                                </td>
                                                <td className="py-2 pr-1 truncate">{term.termDays ?? "—"}</td>
                                                {canManage && (
                                                    <td className="py-2 text-right">
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => openEditDialog(term)}
                                                            disabled={isMutating || loadError !== undefined || isLoadingTerms}
                                                            className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm md:text-base"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </section>
                </CardContent>
            </Card>
        </>
    );
}