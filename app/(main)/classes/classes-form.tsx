"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { AddClassModal } from "./add-class-modal";
import { ClassesTable } from "./classes-table";
import { ClassesLoadingTable } from "./classes-loading-table";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";
import type { getClassPayload, createClassPayload } from "@/types/classes";
import { getOrgMembers, getClasses, getActiveTerm } from "@/fetcher/queries";
import { getApiErrorMessage, useCreateClass, useDeleteClass } from "@/fetcher/mutations";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { ORG_MEMBERS_KEY, ACTIVE_TERM_KEY, classesKey } from "@/fetcher/keys";
import { useUser } from "@/contexts/user-context";

// // Single subject schema (empty first time or fetched from db)
// const singleSubjectSchema = z.object({
//     id: z.string().trim().min(1, { message: "Subject id is required" }),
//     name: z.string().trim().min(1, { message: "Subject name is required" }),
//     department: z.string().trim(),
//     createdAt: z.string().trim(),
//     updatedAt: z.string().trim(),
// });

// Create/add class zod schema
const addClassSchema = z.object({
    name: z.string().trim().max(64, { message: "Class name should not be more than 64 characters" }).min(1, { message: "Class name is required" }),
    formTeacherId: z.string().nullable(),
});
export type CreateClassValues = z.infer<typeof addClassSchema>;

// // Edit class zod schema (extends add class schema with class id field)
// const editClassSchema = addClassSchema.extend({
//     id: z.string().trim().min(1, { message: "Class id is required" }),
// });
// export type EditClassValues = z.infer<typeof editClassSchema>;

export function ClassesForm() {
    // for redirection
    const router = useRouter();
    const pathname = usePathname();
    // for manual retries
    const { mutate } = useSWRConfig();

    // Org admin gate
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && user?.twoFactorEnabled === true && user?.emailVerified === true;

    // Add dialog state and add form
    const [isAddOpen, setIsAddOpen] = useState(false);
    const addForm = useForm<CreateClassValues>({
        resolver: zodResolver(addClassSchema),
        defaultValues: { name: "", formTeacherId: "" },
    });

    // Delete dialog state and class to delete
    const [classToDelete, setClassToDelete] = useState<getClassPayload | null>(null);

    // Fetch the active term from the api. Extract the id for the next request
    const { data: activeTerm, error: activeTermError, isLoading: isLoadingActiveTerm, statusCode: activeTermStatusCode } = getActiveTerm();
    const activeTermId = activeTerm?.id ?? null;

    // Wait for the active term before fetching classes with subject assignments — avoids a redundant request without termId
    // If there is an active term, this fetches the classes with subject assignments for that term.
    // If there is no active term, we use undefined to suspend the fetch while waiting for the active term to resolve.
    const { data: classes = [], error: classesError, isLoading: isLoadingClasses, statusCode: classesStatusCode } = getClasses(activeTermId ? activeTermId : undefined);
    const classList = classes ?? [];
    // Also get the teachers in the organisation
    const { teachers = [], error: teachersError, statusCode: teachersStatusCode } = getOrgMembers();

    // Error handling: split critical (table) vs auxiliary (modals) fetch failures
    const criticalLoadError = activeTermError ?? classesError;
    const auxiliaryLoadError = teachersError;  // teachers are used by the add modal. They don't affect the table itself.

    // Skeleton only while terms or initial classes fetch is in flight
    const isCriticalLoading = isLoadingActiveTerm || (!isLoadingActiveTerm && isLoadingClasses && classList.length === 0);

    // Retry all fetches: revalidate cached data for terms, classes, subjects, and teachers
    function retryAllFetches() {
        void mutate(ACTIVE_TERM_KEY);
        void mutate(ORG_MEMBERS_KEY);
        void mutate(classesKey(activeTermId));
    }

    // Look for redirection errors and redirect to the appropriate page
    useEffect(() => {
        const fetchError = activeTermError ?? classesError ?? teachersError;
        if (!fetchError) return;
        const status = [
            activeTermError ? activeTermStatusCode : null,
            classesError ? classesStatusCode : null,
            teachersError ? teachersStatusCode : null,
        ].find((code) => code === 401 || code === 403);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [activeTermError, classesError, teachersError, activeTermStatusCode, classesStatusCode, teachersStatusCode, router, pathname]);

    // add/delete class mutation hooks
    const { trigger: createClass, isMutating: isCreating, error: createClassError } = useCreateClass();
    const { trigger: deleteClass, isMutating: isDeleting, error: deleteClassError } = useDeleteClass();

    // open add / delete Dialog handlers
    function openAddDialog() {
        if (!canManage) return;
        addForm.reset({ name: "", formTeacherId: "" });
        setIsAddOpen(true);
    }
    function openDeleteDialog(cls: getClassPayload) {
        if (!canManage) return;
        setClassToDelete(cls);
    }

    // Make api call to create new class
    async function addClassHandler(values: CreateClassValues) {
        if (!canManage) return;
        const name = values.name.trim();
        if (classList.some((cls: getClassPayload) => cls.name.toLowerCase() === name.toLowerCase())) {
            toast.error(`Class "${name}" already exists`);
            return;
        }  // check local state for duplicate class name first
        const createClassPayload: createClassPayload = {
            name,
            formTeacherId: values.formTeacherId || null,
        };  // Create the payload and make the api call to create the class
        try {
            const { error: createClassError } = await createClass(createClassPayload);
            if (createClassError) throw createClassError;
            setIsAddOpen(false);
            addForm.reset();
            toast.success(`Class "${name}" added successfully`);
        } catch (err) {
            const mutationErr = createClassError || err;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, `Failed to add class "${name}"`));
            }
        }
    }

    // Make api call to delete class
    async function deleteClassHandler() {
        if (!canManage || !classToDelete) return;
        const name = classToDelete.name;
        try {
            const { error: deleteClassError } = await deleteClass({ id: classToDelete.id });
            if (deleteClassError) throw deleteClassError;
            setClassToDelete(null);
            toast.success(`Class "${name}" deleted successfully`);
        } catch (err) {
            const mutationErr = deleteClassError || err;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, `Failed to delete class "${name}"`));
            }
        }
    }

    // Loading states and control disabled state
    const addLoading = addForm.formState.isSubmitting || isCreating;
    const deleteLoading = isDeleting;
    const isMutating = addLoading || deleteLoading;
    const controlsDisabled = isMutating || isCriticalLoading || !!criticalLoadError || classList.length === 0;

    return (
        <>
            {/* Classes title and description */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Classes</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Add class modal */}
            <AddClassModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                addForm={addForm}
                onSubmit={addClassHandler}
                readOnly={!canManage}
                loading={addLoading}
                teacherOptions={teachers}
            />

            {/* Delete confirmation */}
            <ConfirmDialog
                open={classToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !deleteLoading) setClassToDelete(null);
                }}
                title="Delete class?"
                description={
                    classToDelete
                        ? `Delete "${classToDelete.name}"? This cannot be undone. Classes with subject assignments or export requests cannot be deleted until those are removed.`
                        : "Delete this class? This cannot be undone."
                }
                confirmLabel="Delete Class"
                loading={deleteLoading}
                disabled={!classToDelete}
                onConfirm={deleteClassHandler}
            />

            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">
                        {/* All Classes title and add button */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* Title and description */}
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-foreground md:text-lg">
                                    All Classes ({classList.length})
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Organise students, assign form teachers, and link subjects.
                                </p>
                            </div>
                            {canManage && (
                                <Button
                                    type="button"
                                    onClick={openAddDialog}
                                    className="h-10 cursor-pointer whitespace-nowrap md:h-12"
                                    disabled={isMutating || isCriticalLoading || !!criticalLoadError}
                                >
                                    Add Class
                                </Button>
                            )}
                        </div>
                        <hr className="my-3" />

                        {/* If terms or classes are loading and there is no cached data, show the skeleton */}
                        {isCriticalLoading && classList.length === 0 ? (
                            <ClassesLoadingTable />
                        ) : criticalLoadError ? (
                            // If terms or classes fail to load, show the critical error banner
                            <ErrorBanner
                                title={classesError && !activeTermError ? "Could not load classes" : "Could not load page data"}
                                message={getApiErrorMessage(criticalLoadError, "Failed to load classes. Please try again.")}
                                onRetry={retryAllFetches}
                            />
                        ) : (
                            <div className="space-y-4">
                                {/* Auxiliary fetch failures — subjects/teachers used by modals, not the table itself */}
                                {auxiliaryLoadError ? (
                                    <ErrorBanner
                                        title="Could not load form data"
                                        message={getApiErrorMessage(
                                            auxiliaryLoadError,
                                            "Failed to load subjects or teachers. Please try again.",
                                        )}
                                        onRetry={retryAllFetches}
                                    />
                                ) : null}

                                {classList.length === 0 ? (
                                    // If there are no classes after loading, show the empty no entry component
                                    <EmptyNoEntry
                                        embedded
                                        title="No classes yet"
                                        description="Add a class to organise students and assign form teachers."
                                        actionLabel={canManage ? "Add Class" : undefined}
                                        onAction={canManage ? openAddDialog : undefined}
                                    />
                                ) : (
                                    // Finally, if there are classes, show the classes table
                                    <div className="py-3">
                                        <ClassesTable
                                            classes={classList}
                                            canManage={canManage}
                                            isMutating={isMutating}
                                            disabled={controlsDisabled}
                                            onDeleteClass={openDeleteDialog}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </CardContent>
            </Card>
        </>
    );
}