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
import { EditClassModal } from "./edit-class-modal";
import { ClassesTable } from "./classes-table";
import { ClassesLoadingTable } from "./classes-loading-table";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";
import type { getClassPayload, createClassPayload, updateClassPayload } from "@/types/classes";
import { getSubjects, getClasses, getTerms, getOrgMembers } from "@/fetcher/queries";
import { getApiErrorMessage, getHttpStatus, useCreateClass, useUpdateClass, useDeleteClass } from "@/fetcher/mutations";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { ORG_MEMBERS_KEY, SUBJECTS_KEY, TERMS_KEY, classesKey } from "@/fetcher/keys";
import type { singleGetSubjectPayload } from "@/types/subjects";
import { singleTermPayload } from "@/types/term";
import { useUser } from "@/contexts/user-context";

// Single subject schema (empty first time or fetched from db)
const singleSubjectSchema = z.object({
    id: z.string().trim().min(1, { message: "Subject id is required" }),
    name: z.string().trim().min(1, { message: "Subject name is required" }),
    department: z.string().trim(),
    createdAt: z.string().trim(),
    updatedAt: z.string().trim(),
});

// Create/add class zod schema
const addClassSchema = z.object({
    name: z.string().trim().max(64, { message: "Class name should not be more than 64 characters" }).min(1, { message: "Class name is required" }),
    formTeacherId: z.string().nullable(),
    subjects: z.array(singleSubjectSchema).optional(),
});
export type CreateClassValues = z.infer<typeof addClassSchema>;

// Edit class zod schema (extends add class schema with class id field)
const editClassSchema = addClassSchema.extend({
    id: z.string().trim().min(1, { message: "Class id is required" }),
});
export type EditClassValues = z.infer<typeof editClassSchema>;

export function ClassesForm() {
    const router = useRouter();
    const pathname = usePathname();
    const { mutate } = useSWRConfig();

    // Org admin gate
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && !(user?.twoFactorEnabled === true) && user?.emailVerified === true;

    // Add dialog state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const addForm = useForm<CreateClassValues>({
        resolver: zodResolver(addClassSchema),
        defaultValues: { name: "", formTeacherId: "", subjects: [] },
    });

    // Edit dialog state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<getClassPayload | null>(null);
    const [classToDelete, setClassToDelete] = useState<getClassPayload | null>(null);
    const editForm = useForm<EditClassValues>({
        resolver: zodResolver(editClassSchema),
        defaultValues: { id: "", name: "", formTeacherId: "", subjects: [] },
    });

    // Fetch subjects and terms from API (subjects load in parallel with terms)
    const { data: subjects, error: subjectsError, statusCode: subjectsStatusCode } = getSubjects();
    const { data: termsData, error: termsError, isLoading: isLoadingTerms, statusCode: termsStatusCode } = getTerms();
    const termsReady = !isLoadingTerms;
    const activeTermId = (termsData as singleTermPayload[] | undefined)?.find((term) => term.status === "ACTIVE")?.id ?? null;

    // Wait for terms before fetching classes — avoids a redundant request without termId
    const { data: classes, error: classesError, isLoading: isLoadingClasses, statusCode: classesStatusCode } = getClasses(
        termsReady ? activeTermId : undefined,
    );
    const { teachers, error: teachersError, statusCode: teachersStatusCode } = getOrgMembers();

    // Error handling: split critical (table) vs auxiliary (modals) fetch failures
    const classList = (classes ?? []) as getClassPayload[];
    const criticalLoadError = termsError ?? classesError;
    const auxiliaryLoadError = subjectsError ?? teachersError;

    // Skeleton only while terms or initial classes fetch is in flight
    const isCriticalLoading =
        isLoadingTerms || (termsReady && isLoadingClasses && classList.length === 0);

    // Retry all fetches: revalidate cached data for terms, classes, subjects, and teachers
    function retryAllFetches() {
        void mutate(TERMS_KEY);
        void mutate(SUBJECTS_KEY);
        void mutate(ORG_MEMBERS_KEY);
        void mutate(classesKey(activeTermId));
    }

    // Look for redirection errors and redirect to the appropriate page
    useEffect(() => {
        const fetchError = termsError ?? classesError ?? subjectsError ?? teachersError;
        if (!fetchError) return;
        const status = [
            termsError ? termsStatusCode : null,
            classesError ? classesStatusCode : null,
            subjectsError ? subjectsStatusCode : null,
            teachersError ? teachersStatusCode : null,
        ].find((code) => code === 401 || code === 403);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [termsError, classesError, subjectsError, teachersError, termsStatusCode, classesStatusCode, subjectsStatusCode, teachersStatusCode, router, pathname]);

    const { trigger: createClass, isMutating: isCreating, error: createClassError } = useCreateClass();
    const { trigger: updateClass, isMutating: isUpdating, error: updateClassError } = useUpdateClass();
    const { trigger: deleteClass, isMutating: isDeleting, error: deleteClassError } = useDeleteClass();

    // Dialog handlers
    function openAddDialog() {
        if (!canManage) return;
        addForm.reset({ name: "", formTeacherId: "", subjects: [] });
        setIsAddOpen(true);
    }

    function openEditDialog(cls: getClassPayload) {
        if (!canManage) return;
        setEditingClass(cls);
        editForm.reset({
            id: cls.id,
            name: cls.name,
            formTeacherId: cls.formTeacher?.id ?? null,
            subjects: cls.subjects ?? [],
        });
        setIsEditOpen(true);
    }

    function openDeleteDialog(cls: getClassPayload) {
        if (!canManage) return;
        setClassToDelete(cls);
    }

    // Make api call to create new class + assign subjects to it (why we need active term)
    async function addClassHandler(values: CreateClassValues) {
        if (!canManage) return;
        const name = values.name.trim();
        if (classList.some((cls) => cls.name.toLowerCase() === name.toLowerCase())) {
            toast.error(`Class "${name}" already exists`);
            return;
        }

        const selectedSubjects = values.subjects ?? [];
        if (selectedSubjects.length > 20) {
            toast.error("Maximum of 20 subjects can be assigned to a class");
            return;
        }
        if (selectedSubjects.length > 0 && !activeTermId) {
            toast.error("An active term is required when assigning subjects to a class");
            return;
        }

        const createClassPayload: createClassPayload = {
            name,
            formTeacherId: values.formTeacherId || null,
            ...(selectedSubjects.length > 0 && activeTermId
                ? { activeTermId, subjectIds: selectedSubjects.map((subject) => subject.id) }
                : {}),
        };

        try {
            await createClass(createClassPayload);
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

    // Make api call to update an existing class
    async function editClassHandler(values: EditClassValues) {
        if (!canManage) return;
        if (!editingClass) return;

        const id = values.id;
        const name = values.name.trim();
        if (classList.some((cls) => cls.id !== id && cls.name.toLowerCase() === name.toLowerCase())) {
            toast.error(`Class "${name}" already exists`);
            return;
        }

        const selectedSubjects = values.subjects ?? [];
        if (selectedSubjects.length > 20) {
            toast.error("Maximum of 20 subjects can be assigned to a class");
            return;
        }

        const subjectsDirty = Boolean(editForm.formState.dirtyFields.subjects);
        if (subjectsDirty && !activeTermId) {
            toast.error("An active term is required when updating subject assignments");
            return;
        }

        const updateClassPayload: updateClassPayload = {
            id,
            name,
            formTeacherId: values.formTeacherId || null,
            ...(subjectsDirty && activeTermId
                ? { activeTermId, subjectIds: selectedSubjects.map((subject) => subject.id) }
                : {}),
        };

        try {
            await updateClass(updateClassPayload);
            setIsEditOpen(false);
            setEditingClass(null);
            toast.success(`Class "${name}" updated successfully`);
        } catch (err) {
            const mutationErr = updateClassError || err;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, `Failed to update class "${name}"`));
            }
        }
    }

    async function deleteClassHandler() {
        if (!canManage || !classToDelete) return;
        const name = classToDelete.name;
        try {
            await deleteClass({ id: classToDelete.id });
            setClassToDelete(null);
            toast.success(`Class "${name}" deleted successfully`);
        } catch (err) {
            const mutationErr = deleteClassError || err;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, `Failed to delete class "${name}"`));
            }
        }
    }

    const addLoading = addForm.formState.isSubmitting || isCreating;
    const editLoading = editForm.formState.isSubmitting || isUpdating;
    const deleteLoading = isDeleting;
    const isMutating = addLoading || editLoading || deleteLoading;
    const controlsDisabled =
        isMutating || isCriticalLoading || !!criticalLoadError || classList.length === 0;

    return (
        <>
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
                subjectOptions={(subjects ?? []) as singleGetSubjectPayload[]}
                canAssignSubjects={Boolean(activeTermId)}
            />

            {/* Edit class modal */}
            <EditClassModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                editForm={editForm}
                onEditSubmit={editClassHandler}
                readOnly={!canManage}
                loading={editLoading}
                teacherOptions={teachers}
                subjectOptions={(subjects ?? []) as singleGetSubjectPayload[]}
                initialSubjects={editingClass?.subjects ?? []}
                canAssignSubjects={Boolean(activeTermId)}
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
                                title={classesError && !termsError ? "Could not load classes" : "Could not load page data"}
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
                                            onEditClass={openEditDialog}
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
