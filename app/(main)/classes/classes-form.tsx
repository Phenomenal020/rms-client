"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BookOpen, Pencil } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { AddClassModal } from "./add-class-modal";
import { EditClassModal } from "./edit-class-modal";
import { ClassesLoadingTable } from "./classes-loading-table";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import type { getClassPayload } from "@/types/classes";
import { getSubjects, getClasses, getTerms, getOrgMembers, ORG_MEMBERS_KEY } from "@/fetcher/queries";
import { getApiErrorMessage, getHttpStatus, useCreateClass, useUpdateClass } from "@/fetcher/mutations";
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
    name: z.string().trim().min(1, { message: "Class name is required" }),
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
    const canManage = user?.role === "orgadmin" && user?.twoFactorEnabled === true;   // disable management features (add/edit) for non-orgadmin users

    //  Add dialog: Toggle, resolver, and defaults
    const [isAddOpen, setIsAddOpen] = useState(false);
    const addForm = useForm<CreateClassValues>({
        resolver: zodResolver(addClassSchema),
        defaultValues: { name: "", formTeacherId: "", subjects: [] },
    });

    // Edit dialog: Toggle, target, resolver, and defaults
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
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
    let { data: classes, error: classesError, isLoading: isLoadingClasses, statusCode: classesStatusCode } = getClasses(
        termsReady ? activeTermId : undefined,
    );  // When undefined, getClasses does not run. A clever workaround react hooks and conditional rendering
    const { teachers, error: teachersError, isLoading: isLoadingTeachers, statusCode: teachersStatusCode } = getOrgMembers();

    // Error handling: split critical (table) vs auxiliary (modals) fetch failures
    const classList = (classes ?? []) as getClassPayload[];
    const criticalLoadError = termsError ?? classesError;  // entire page needs these
    const auxiliaryLoadError = subjectsError ?? teachersError;  // only modals need these
    const loadError = criticalLoadError ?? auxiliaryLoadError;  // aggregation
    const showClassCount = !classesError && classes !== undefined;  // hide/show class count

    // MUTATIONS: Handle authentication redirects: use the status code to determine the redirect (401, 403)
    function handleAuthRedirect(err: unknown): boolean {
        const status = getHttpStatus(err);
        if (status === 401) {
            toast.error("You are not authenticated. Please sign in to continue");
            router.replace(`/sign-in?redirect=${pathname}`);
            return true;
        }
        if (status === 403) {
            toast.error("You are not authorized to access this page. Please contact your admin if you believe this is an error.");
            router.replace("/forbidden");
            return true;
        }
        return false;  // if the error is not 401 or 403, return false (no redirect)
    }

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
    const { trigger: createClass, isMutating: isCreating, error: createClassError, data: createClassData } = useCreateClass();
    const { trigger: updateClass, isMutating: isUpdating, error: updateClassError, data: updateClassData } = useUpdateClass();
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
        addForm.reset({ name: "", formTeacherId: null, subjects: [] });
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

    // Make api call to create new class + assign subjects to it (why we need active term)
    async function addClassHandler() {
        if (!canManage) return; // return early if the user is not an org admin
        // Validate the class name is not already in use locally before hitting the API
        const name = addForm.getValues().name.trim();
        if (classList.some((cls) => cls.name.toLowerCase() === name.toLowerCase())) {
            toast.error(`Class "${name}" already exists`);
            return;
        }

        // construct create class payload
        const createClassPayload: createClassPayload = {
            activeTermId: activeTermId ?? null,
            name,
            formTeacherId: addForm.getValues().formTeacherId || null,
            subjectIds: addForm.getValues().subjects?.map((subject) => subject.id) ?? [],
        };

        // Now, make the api call to create the class
        try {
            await createClass(createClassPayload);  // No need to get the data back, just wait for the mutation to complete
            // resets and success toast
            setIsAddOpen(false);
            addForm.reset();
            toast.success(`Class "${name}" added successfully`);
        } catch (err) {
            // if the error is 401 or 403, redirect to the sign in page. Otherwise, simply show the error toast
            const mutationErr = createClassError || err;
            if (!handleAuthRedirect(mutationErr)) {
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

        // construct the update class payload
        const updateClassPayload: updateClassPayload = {
            id,
            activeTermId: activeTermId ?? null,
            name,
            formTeacherId: values.formTeacherId || null,
            subjectIds: values.subjects?.map((subject) => subject.id) ?? [],
        };

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
            if (!handleAuthRedirect(mutationErr)) {
                toast.error(getApiErrorMessage(mutationErr, `Failed to update class "${name}"`));
            }
        }
    }

    // Loading states
    const addLoading = addForm.formState.isSubmitting || isCreating;
    const editLoading = editForm.formState.isSubmitting || isUpdating;
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
                                    disabled={addLoading || editLoading || loadError !== undefined || isComponentLoading}
                                />
                                {canManage && (
                                    <Button
                                        type="button"
                                        onClick={openAddDialog}
                                        className="cursor-pointer whitespace-nowrap h-10 md:h-12"
                                        disabled={addLoading || editLoading || loadError !== undefined || isComponentLoading || !activeTermId}
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
                                        <table className="table-fixed min-w-[480px] w-full border-collapse text-sm md:text-base text-left">
                                            {/* Table columns */}
                                            <colgroup>
                                                <col className="w-[10%]" />
                                                <col className="w-[20%]" />
                                                <col className="w-[35%]" />
                                                <col className="w-[25%]" />
                                                <col className="w-[10%]" />
                                            </colgroup>
                                            {/* Table header */}
                                            <thead>
                                                <tr className="bg-muted/50 border-b border-border">
                                                    <th className="p-2 font-semibold text-muted-foreground">S/N</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">Class</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">Class Teacher</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">Subjects</th>
                                                    <th className="p-2 font-semibold text-muted-foreground" />
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
                                                                {canManage && (
                                                                    <td className="p-2">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => openEditDialog(index)}
                                                                            disabled={addLoading || editLoading || loadError !== undefined || isComponentLoading}
                                                                            className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300"
                                                                            aria-label="Edit class"
                                                                        >
                                                                            <Pencil className="h-3 w-3" />
                                                                            <span className="hidden md:inline">Edit</span>
                                                                        </Button>
                                                                    </td>
                                                                )}
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