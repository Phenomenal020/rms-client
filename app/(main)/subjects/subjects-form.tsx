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
import { AddSubjectModal } from "./add-subject-modal";
import { EditSubjectModal } from "./edit-subject-modal";
import { SubjectsTable } from "./subjects-table";
import { SubjectsLoadingTable } from "./subjects-loading-table";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";
import { getApiErrorMessage, getHttpStatus, useCreateSubject, useUpdateSubject, useDeleteSubject } from "@/fetcher/mutations";
import { getSubjects } from "@/fetcher/queries";
import { SUBJECTS_KEY } from "@/fetcher/keys";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { useUser } from "@/contexts/user-context";
import { singleGetSubjectPayload } from "@/types/subjects";

const addSubjectSchema = z.object({
    name: z.string().trim().max(128, { message: "Subject name should not be more than 128 characters" }).min(1, { message: "Subject name is required" }),
    department: z.enum(["none", "commerce", "science", "arts", "general"]),
});
export type AddSubjectValues = z.infer<typeof addSubjectSchema>;

const editSubjectSchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(1, { message: "Subject name is required" }),
    department: z.enum(["none", "commerce", "science", "arts", "general"]),
});
export type EditSubjectValues = z.infer<typeof editSubjectSchema>;

const DEPARTMENT_OPTIONS: AddSubjectValues["department"][] = [
    "none",
    "general",
    "arts",
    "science",
    "commerce",
];

export function SubjectsForm() {
    const router = useRouter();
    const pathname = usePathname();
    const { mutate } = useSWRConfig();

    // Check the user is an org admin and has two-factor enabled
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && user?.twoFactorEnabled === true;

    // Fetch subjects for the organisation
    const { data: subjects, isLoading: isLoadingSubjects, error: subjectsError } = getSubjects();
    const subjectList = (subjects ?? []) as singleGetSubjectPayload[];

    // Mutations for creating, updating, and deleting subjects
    const { trigger: createSubject, isMutating: isCreatingSubject } = useCreateSubject();
    const { trigger: updateSubject, isMutating: isUpdatingSubject } = useUpdateSubject();
    const { trigger: deleteSubject, isMutating: isDeletingSubject } = useDeleteSubject();

    // Dialog state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<singleGetSubjectPayload | null>(null);

    // Forms for adding and editing subjects
    const addForm = useForm<AddSubjectValues>({
        resolver: zodResolver(addSubjectSchema),
        defaultValues: { name: "", department: "none" },
    });
    const editForm = useForm<EditSubjectValues>({
        resolver: zodResolver(editSubjectSchema),
        defaultValues: { id: "", name: "", department: "none" },
    });

    // Manually invalidate the subjects cache
    function retryAllFetches() {
        void mutate(SUBJECTS_KEY);
    }

    // Redirect on auth errors
    useEffect(() => {
        if (!subjectsError) return;
        const status = getHttpStatus(subjectsError);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [subjectsError, router, pathname]);

    // Open the add subject dialog
    function openAddSubjectDialog() {
        if (!canManage) return;
        addForm.reset({ name: "", department: "none" });
        setIsAddDialogOpen(true);
    }

    // Open the edit subject dialog
    function openEditSubjectDialog(subject: singleGetSubjectPayload) {
        if (!canManage) return;
        if (!subjectList.some((entry) => entry.id === subject.id)) return;
        editForm.reset({
            id: subject.id,
            name: subject.name,
            department: subject.department as EditSubjectValues["department"],
        });
        setIsEditDialogOpen(true);
    }

    // Open the delete subject dialog
    function openDeleteSubjectDialog(subject: singleGetSubjectPayload) {
        if (!canManage) return;
        setSubjectToDelete(subject);
    }

    // Add a subject
    async function addSubjectHandler(values: AddSubjectValues) {
        if (!canManage) return;
        const subjectName = values.name.trim();
        const exists = subjectList.some(
            (entry) => entry.name.toLowerCase() === subjectName.toLowerCase(),
        );
        if (exists) {
            toast.error(`Subject "${subjectName}" already exists`);
            return;
        }
        try {
            await createSubject({
                name: values.name,
                department: values.department,
            });
            setIsAddDialogOpen(false);
            addForm.reset({ name: "", department: "none" });
            toast.success(`Subject "${subjectName}" added successfully`);
        } catch (error) {
            if (!handleAuthRedirect(error, { router, pathname })) {
                toast.error(getApiErrorMessage(error, "Failed to add subject. Please try again."));
            }
        }
    }

    // Update a subject
    async function updateSubjectHandler(values: EditSubjectValues) {
        if (!canManage) return;
        const subjectName = values.name.trim();
        const exists = subjectList.some(
            (entry) =>
                entry.id !== values.id &&
                entry.name.toLowerCase() === subjectName.toLowerCase(),
        );
        if (exists) {
            toast.error(`Subject "${subjectName}" already exists`);
            return;
        }
        try {
            await updateSubject({
                id: values.id,
                name: values.name,
                department: values.department,
            });
            setIsEditDialogOpen(false);
            toast.success(`Subject "${subjectName}" updated successfully`);
        } catch (error) {
            if (!handleAuthRedirect(error, { router, pathname })) {
                toast.error(getApiErrorMessage(error, "Failed to update subject. Please try again."));
            }
        }
    }

    // Delete a subject
    async function deleteSubjectHandler() {
        if (!canManage || !subjectToDelete) return;
        const subjectName = subjectToDelete.name;
        try {
            await deleteSubject({ id: subjectToDelete.id });
            setSubjectToDelete(null);
            toast.success(`Subject "${subjectName}" deleted successfully`);
        } catch (error) {
            if (!handleAuthRedirect(error, { router, pathname })) {
                toast.error(getApiErrorMessage(error, "Failed to delete subject. Please try again."));
            }
        }
    }

    // Loading states
    const addLoading = addForm.formState.isSubmitting || isCreatingSubject;
    const editLoading = editForm.formState.isSubmitting || isUpdatingSubject;
    const deleteLoading = isDeletingSubject;
    const isMutating = addLoading || editLoading || deleteLoading;
    const controlsDisabled =
        isMutating || isLoadingSubjects || !!subjectsError || subjectList.length === 0;

    return (
        <>
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Add subject modal */}
            <AddSubjectModal
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                addForm={addForm}
                onSubmit={addSubjectHandler}
                loading={addLoading}
                readOnly={!canManage}
                departmentOptions={DEPARTMENT_OPTIONS}
            />

            {/* Edit subject modal */}
            <EditSubjectModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                editForm={editForm}
                onSubmit={updateSubjectHandler}
                loading={editLoading}
                readOnly={!canManage}
                departmentOptions={DEPARTMENT_OPTIONS}
            />

            {/* Delete confirmation */}
            <ConfirmDialog
                open={subjectToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !deleteLoading) setSubjectToDelete(null);
                }}
                title="Delete subject?"
                description={
                    subjectToDelete
                        ? `Delete "${subjectToDelete.name}"? This cannot be undone. Subjects assigned to classes cannot be deleted until those assignments are removed.`
                        : "Delete this subject? This cannot be undone."
                }
                confirmLabel="Delete Subject"
                loading={deleteLoading}
                disabled={!subjectToDelete}
                onConfirm={deleteSubjectHandler}
            />

            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">
                        {/* All Subjects title and add button */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* Title and description */}
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-foreground md:text-lg">
                                    All Subjects ({subjectList.length})
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Manage subjects for your school.
                                </p>
                            </div>
                            {canManage && (
                                <Button
                                    type="button"
                                    onClick={openAddSubjectDialog}
                                    className="h-10 w-fit cursor-pointer whitespace-nowrap md:h-12 sm:self-center"
                                    disabled={isMutating || isLoadingSubjects || !!subjectsError}
                                >
                                    Add Subject
                                </Button>
                            )}
                        </div>
                        <hr className="my-3" />

                        {/* If subjects are loading and there is no cached data, show the skeleton */}
                        {isLoadingSubjects && subjectList.length === 0 ? (
                            <SubjectsLoadingTable />
                        ) : subjectsError ? (
                            // If there is an error loading subjects, show the error banner
                            <ErrorBanner
                                title="Could not load subjects"
                                message={getApiErrorMessage(subjectsError, "Failed to load subjects. Please try again.")}
                                onRetry={retryAllFetches}
                            />
                        ) : subjectList.length === 0 ? (
                            // If there are no subjects after loading, show the empty no entry component
                            <EmptyNoEntry
                                embedded
                                title="No subjects yet"
                                description="Add subjects for your school so they can be assigned to classes."
                                actionLabel={canManage ? "Add Subject" : undefined}
                                onAction={canManage ? openAddSubjectDialog : undefined}
                            />
                        ) : (
                            // Finally, if there are subjects, show the subjects table
                            <div className="py-3">
                                <SubjectsTable
                                    subjects={subjectList}
                                    canManage={canManage}
                                    isMutating={isMutating}
                                    disabled={controlsDisabled}
                                    onEditSubject={openEditSubjectDialog}
                                    onDeleteSubject={openDeleteSubjectDialog}
                                />
                            </div>
                        )}
                    </section>
                </CardContent>
            </Card>
        </>
    );
}
