"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { AddClassModal } from "./add-class-modal";
import { EditClassModal } from "./edit-class-modal";
import { ClassesLoadingTable } from "./classes-loading-table";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";
import type { getClassPayload } from "@/types/classes";
import { getSubjects, getClasses, getTerms, getOrgMembers, ORG_MEMBERS_KEY } from "@/fetcher/queries";
import { getApiErrorMessage, getHttpStatus, useCreateClass, useUpdateClass, useDeleteClass } from "@/fetcher/mutations";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { ErrorBanner } from "@/shared-components/error-banner";
import { useSWRConfig } from "swr";
import type { createClassPayload, updateClassPayload } from "@/types/classes";
import type { singleGetSubjectPayload } from "@/types/subjects";
import { singleTermPayload } from "@/types/term";
import { useUser } from "@/contexts/user-context";

// single subject schema (empty first time or fetched from db)
const singleSubjectSchema = z.object({
    id: z.string().trim().min(1, { message: "Subject id is required" }),
    name: z.string().trim().min(1, { message: "Subject name is required" }),
    department: z.string().trim(),  // a subject does not have to be assigned to a department
    createdAt: z.string().trim(),
    updatedAt: z.string().trim(),
});
// create/add class zod schema
const addClassSchema = z.object({
    name: z.string().trim().max(64, { message: "Class name should not be more than 64 characters" }).min(1, { message: "Class name is required" }),
    formTeacherId: z.string().nullable(),  // either assigned or not assigned (null)
    subjects: z.array(singleSubjectSchema).optional(),  // a class does not have to be assigned any subjects upon creation
});
export type CreateClassValues = z.infer<typeof addClassSchema>;  // create a type from the schema
// edit class zod schema (extends add class schema with class id field)
const editClassSchema = addClassSchema.extend({
    id: z.string().trim().min(1, { message: "Class id is required" }), // to track the class being edited
});
export type EditClassValues = z.infer<typeof editClassSchema>;


//  Component 
export function ClassesForm() {
    // for redirects
    const router = useRouter();
    const pathname = usePathname();

    // search query
    const [searchQuery, setSearchQuery] = useState("");

    // Org admin gate
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && !(user?.twoFactorEnabled === true) && user?.emailVerified === true;

    //  Add dialog: Toggle, resolver, and defaults
    const [isAddOpen, setIsAddOpen] = useState(false);
    const addForm = useForm<CreateClassValues>({
        resolver: zodResolver(addClassSchema),
        defaultValues: { name: "", formTeacherId: "", subjects: [] },
    });

    // Edit dialog: Toggle, target, resolver, and defaults
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [classToDelete, setClassToDelete] = useState<getClassPayload | null>(null);
    const editForm = useForm<EditClassValues>({
        resolver: zodResolver(editClassSchema),
        defaultValues: { id: "", name: "", formTeacherId: "", subjects: [] },
    });

    // fetch subjects and terms from API (subjects load in parallel with terms)
    const { data: subjects, error: subjectsError, isLoading: isLoadingSubjects, statusCode: subjectsStatusCode } = getSubjects();
    const { data: termsData, error: termsError, isLoading: isLoadingTerms, statusCode: termsStatusCode } = getTerms();
    const termsReady = !isLoadingTerms;
    const activeTermId = (termsData as singleTermPayload[] | undefined)?.find((term) => term.status === "ACTIVE")?.id ?? null;
    // Wait for terms before fetching classes — avoids a redundant request without termId. 
    const { data: classes, error: classesError, isLoading: isLoadingClasses, statusCode: classesStatusCode } = getClasses(
        termsReady ? activeTermId : undefined,
    );  // When undefined, getClasses does not run. A clever workaround react hooks and conditional rendering
    const { teachers, error: teachersError, isLoading: isLoadingTeachers, statusCode: teachersStatusCode } = getOrgMembers();

    // Error handling: split critical (table) vs auxiliary (modals) fetch failures
    const classList = (classes ?? []) as getClassPayload[];
    const criticalLoadError = termsError ?? classesError;  // entire page needs these
    const auxiliaryLoadError = subjectsError ?? teachersError;  // only modals need these
    const loadError = (criticalLoadError ?? auxiliaryLoadError) ?? null;  // aggregation
    const showClassCount = !classesError && classes !== undefined;  // hide/show class count

    // Retry all fetches: revalidate the cached data (basically rerenders the component)
    function retryAllFetches() {
        void mutate("/api/v1/terms");
        void mutate("/api/v1/subjects");
        void mutate(ORG_MEMBERS_KEY);
        void mutate((key) => typeof key === "string" && key.startsWith("/api/v1/classes"));
    }

    // QUERIES: Look for redirection errors and redirect to the appropriate page
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

    // mutations
    const { trigger: createClass, isMutating: isCreating, error: createClassError } = useCreateClass();
    const { trigger: updateClass, isMutating: isUpdating, error: updateClassError } = useUpdateClass();
    const { trigger: deleteClass, isMutating: isDeleting, error: deleteClassError } = useDeleteClass();
    // On error, manually trigger a revalidation of the cached data (rerenders the component)
    const { mutate } = useSWRConfig();

    // Derived: filtered classes based on search query (class name and form teacher name)
    const filteredClasses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();  // normalise the search query
        if (!query) return classList;  // if no query, return all classes 
        return classList.filter((cls) => {
            const teacherName = (cls.formTeacher?.name ?? "Not Assigned").toLowerCase();
            return cls.name.toLowerCase().includes(query) || teacherName.includes(query);
        }); // otherwise, filter classes based on name and form teacher name
    }, [classList, searchQuery]);

    // Open add dialog: Reset form and set toggle
    function openAddDialog() {
        if (!canManage) return;  // return early if the user is not an org admin
        addForm.reset({ name: "", formTeacherId: "", subjects: [] });
        setIsAddOpen(true);
    }
    // Open edit dialog: Reset form with the class being edited
    function openEditDialog(index: number) {
        if (!canManage) return;  // return early if the user is not an org admin
        setEditingIndex(index);
        const editClass = filteredClasses[index];
        editForm.reset({
            id: editClass?.id ?? "",
            name: editClass?.name,
            formTeacherId: editClass?.formTeacher?.id ?? null,
            subjects: editClass?.subjects ?? [],
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

        const subjects = values.subjects ?? [];
        if (subjects.length > 20) {
            toast.error("Maximum of 20 subjects can be assigned to a class");
            return;
        }
        if (subjects.length > 0 && !activeTermId) {
            toast.error("An active term is required when assigning subjects to a class");
            return;
        }

        const createClassPayload: createClassPayload = {
            name,
            formTeacherId: values.formTeacherId || null,
            ...(subjects.length > 0 && activeTermId
                ? { activeTermId, subjectIds: subjects.map((subject) => subject.id) }
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
        if (!canManage) return;  // return early if the user is not an org admin
        // If there is nothing to edit, return early
        if (editingIndex === null) return;
        // Check the new name isn't already taken by a *different* class
        const id = values.id;
        const name = values.name.trim();
        if (classList.some((cls) => cls.id !== id && cls.name.toLowerCase() === name.toLowerCase())) {
            toast.error(`Class "${name}" already exists`);
            return;
        }

        // Ensure subjectIds are not more than 20
        const subjects = values.subjects ?? [];
        if (subjects.length > 20) {
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
                ? { activeTermId, subjectIds: subjects.map((subject) => subject.id) }
                : {}),
        };

        console.log("updateClassPayload", updateClassPayload);

        // Now, make the api call to update the class
        try {
            await updateClass(updateClassPayload);  // No need to get the data back, just trigger the mutation
            // resets and success toast
            setIsEditOpen(false);
            setEditingIndex(null);
            toast.success(`Class "${name}" updated successfully`);
        } catch (err) {
            const mutationErr = updateClassError || err;
            // if the error is not 401 or 403, show the error toast
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

    // Loading states
    const addLoading = addForm.formState.isSubmitting || isCreating;
    const editLoading = editForm.formState.isSubmitting || isUpdating;
    const deleteLoading = isDeleting;
    const isMutating = addLoading || editLoading || deleteLoading;
    // Block table until terms, classes, and teachers resolve
    const isComponentLoading = !termsReady || isLoadingClasses || isLoadingTeachers || isLoadingSubjects

    // Render the component
    return (
        <>
            {/* Page Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Classes</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Add Class Modal */}
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

            {/* Edit Class Modal */}
            <EditClassModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                editForm={editForm}
                onEditSubmit={editClassHandler}
                readOnly={!canManage}
                loading={editLoading}
                teacherOptions={teachers}
                subjectOptions={(subjects ?? []) as singleGetSubjectPayload[]}
                initialSubjects={editingIndex !== null ? filteredClasses[editingIndex]?.subjects ?? [] : []}
                canAssignSubjects={Boolean(activeTermId)}
            />

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

            {/* Main Card */}
            <Card className="border shadow-md">
                <CardContent className="space-y-6">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Header: count + search + add */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* All classes header text */}
                            <h4 className="text-base md:text-lg font-semibold text-foreground">
                                All Classes{showClassCount ? ` (${classList.length})` : ""}
                            </h4>
                            {/* Search input and add class button */}
                            <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="h-10 md:h-12 w-full sm:max-w-xs"
                                    disabled={isMutating || loadError !== null || isComponentLoading}
                                />
                                {canManage && (
                                    <Button
                                        type="button"
                                        onClick={openAddDialog}
                                        className="cursor-pointer whitespace-nowrap h-10 md:h-12"
                                        disabled={isMutating || loadError !== null || isComponentLoading}
                                    >
                                        Add Class
                                    </Button>
                                )}
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Body: Error banner, loading table, no classes, no classes match search, table body` */}
                        {criticalLoadError ? (
                            <ErrorBanner
                                title={classesError && !termsError ? "Could not load classes" : "Could not load page data"}
                                message={getApiErrorMessage(criticalLoadError, "Failed to load classes. Please try again.")}
                                onRetry={retryAllFetches}
                            />
                        ) : isComponentLoading ? (
                            <ClassesLoadingTable />
                        ) : (
                            <div className="space-y-4">
                                {auxiliaryLoadError && (
                                    <ErrorBanner
                                        title="Could not load form data"
                                        message={getApiErrorMessage(auxiliaryLoadError, "Failed to load subjects or teachers. Please try again.")}
                                        onRetry={retryAllFetches}
                                    />
                                )}
                                {classList.length === 0 ? (
                                    <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                        <p className="text-base font-medium text-muted-foreground">
                                            No classes yet. Please add a class to get started.
                                        </p>
                                    </div>
                                ) : filteredClasses.length === 0 ? (
                                    <div className="py-4 text-center text-sm text-muted-foreground">
                                        No classes match your search.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto py-2">
                                        <table className="table-fixed min-w-[480px] w-full border-collapse text-sm lg:text-base text-left">
                                            {/* Table columns */}
                                            <colgroup>
                                                <col className="w-[8%]" />
                                                <col className="w-[20%]" />
                                                <col className="w-[32%]" />
                                                <col className="w-[20%]" />
                                                <col className="w-[20%]" />
                                            </colgroup>
                                            {/* Table header */}
                                            <thead>
                                                <tr className="bg-muted/50 border-b border-border">
                                                    <th className="p-2 font-semibold text-muted-foreground">S/N</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">Class</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">Class Teacher</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">Subjects</th>
                                                    <th className="p-2 font-semibold text-muted-foreground text-right" />
                                                </tr>
                                            </thead>
                                            {/* Table body */}
                                            <tbody>
                                                {filteredClasses.map((entry: getClassPayload, index: number) => {
                                                    const teacherName = entry.formTeacher?.name ?? null;
                                                    return (
                                                        <React.Fragment key={entry.id}>
                                                            {/* Table row */}
                                                            <tr className="border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors">
                                                                {/* S/N */}
                                                                <td className="p-2 font-medium text-foreground">
                                                                    {index + 1}
                                                                </td>
                                                                {/* Class name */}
                                                                <td className="max-w-0 p-2 font-medium text-foreground">
                                                                    <span className="block truncate" title={entry.name}>
                                                                        {entry.name}
                                                                    </span>
                                                                </td>
                                                                {/* Class teacher */}
                                                                <td className="max-w-0 p-2">
                                                                    <span
                                                                        className="block truncate text-muted-foreground"
                                                                        title={teacherName ?? undefined}
                                                                    >
                                                                        {teacherName ?? (
                                                                            <span className="italic">Not assigned</span>
                                                                        )}
                                                                    </span>
                                                                </td>
                                                                {/* Num Subjects badge */}
                                                                <td className="p-2">
                                                                    {entry.subjects.length === 0 ? (
                                                                        <span className="italic text-xs text-muted-foreground">
                                                                            None assigned
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                                            <BookOpen className="h-3 w-3" />
                                                                            {entry.subjects.length} subject{entry.subjects.length !== 1 ? "s" : ""}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="p-2 text-right">
                                                                    {canManage && (
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => openEditDialog(index)}
                                                                                disabled={isMutating || loadError !== null || isComponentLoading}
                                                                                className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm lg:text-base"
                                                                                aria-label="Edit class"
                                                                            >
                                                                                <Pencil className="h-3 w-3" />
                                                                                <span className="sr-only sm:not-sr-only">Edit</span>
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => openDeleteDialog(entry)}
                                                                                disabled={isMutating || loadError !== null || isComponentLoading}
                                                                                className="cursor-pointer border border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300 text-sm lg:text-base"
                                                                                aria-label="Delete class"
                                                                            >
                                                                                <Trash2 className="h-3 w-3" />
                                                                                <span className="sr-only sm:not-sr-only">Delete</span>
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
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

export { ClassesLoadingTable } from "./classes-loading-table";