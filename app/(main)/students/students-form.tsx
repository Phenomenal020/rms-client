"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";
import { StudentsTable } from "./students-table";
import { AddStudentModal } from "./add-student-modal";
import { EditStudentModal } from "./edit-student-modal";
import { StudentsLoadingTable } from "./students-loading-table";
import { getApiErrorMessage, getHttpStatus, useCreateStudent, useUpdateStudent, useDeleteStudent } from "@/fetcher/mutations";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { getStudents, getClasses } from "@/fetcher/queries";
import { CLASSES_KEY, STUDENTS_KEY } from "@/fetcher/keys";
import { useUser } from "@/contexts/user-context";
import { useSWRConfig } from "swr";
import type { getSingleStudent } from "@/types/students";
import type { getClassPayload } from "@/types/classes";

// add/edit student schema
const addStudentSchema = z.object({
    firstName: z.string().trim().max(128, { message: "First name should not be more than 128 characters" }).min(1, { message: "First name is required" }),
    middleName: z.string().trim().max(128, { message: "Middle name should not be more than 128 characters" }).optional(),
    lastName: z.string().trim().max(128, { message: "Last name should not be more than 128 characters" }).min(1, { message: "Last name is required" }),
    gender: z.enum(["Male", "Female"], { message: "Gender is required" }),
    classId: z.string().nullable().optional(),
});
export type AddStudentValues = z.infer<typeof addStudentSchema>;

const editStudentSchema = addStudentSchema.extend({
    id: z.string().trim().min(1, { message: "ID is required" }),
    status: z.enum(["active", "inactive"], { message: "Status is required" }),
});
export type EditStudentValues = z.infer<typeof editStudentSchema>;

export type ClassOption = { id: string; name: string };

// Title case helper function
export function toTitleCase(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// Display name: fname + midname + lastname
export function getDisplayName(student: Pick<AddStudentValues, "firstName" | "middleName" | "lastName">) {
    const mid = student.middleName?.trim();
    const initial = mid ? ` ${mid.charAt(0).toUpperCase()}.` : "";
    return `${student.firstName.trim()}${initial} ${student.lastName.trim()}`;
}

export function StudentsForm() {
    // Router for redirection and mutate for manual retries
    const router = useRouter();
    const pathname = usePathname();
    const { mutate } = useSWRConfig();

    // Org admin gate
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && user?.twoFactorEnabled === true && user?.emailVerified === true;

    // Fetch students (table) and classes (modals) in parallel
    const { data: students, error: studentsError, isLoading: isLoadingStudents } = getStudents();
    const { data: classes, error: classesError } = getClasses(null);
    const studentList = (students ?? []) as getSingleStudent[];

    const isStudentsInitialLoading = isLoadingStudents && students == null;

    // Create student, update student, and delete student mutations
    const { trigger: createStudent, isMutating: isCreatingStudent, error: createStudentError } = useCreateStudent();
    const { trigger: updateStudent, isMutating: isUpdatingStudent, error: updateStudentError } = useUpdateStudent();
    const { trigger: deleteStudent, isMutating: isDeletingStudent, error: deleteStudentError } = useDeleteStudent();

    // Retry all fetches
    function retryAllFetches() {
        void mutate(STUDENTS_KEY);
        void mutate(CLASSES_KEY);
    }

    // Handle fetch errors
    useEffect(() => {
        const fetchError = studentsError ?? classesError;
        if (!fetchError) return;
        const status = getHttpStatus(fetchError);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [studentsError, classesError, router, pathname]);

    // Create class options
    const classOptions: ClassOption[] = useMemo(
        () => (classes ?? []).map((c: getClassPayload) => ({ id: c.id, name: c.name })),
        [classes],
    );

    // Create/Edit state for the modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    // Track student to delete
    const [studentToDelete, setStudentToDelete] = useState<getSingleStudent | null>(null);

    // Create/Edit forms for the modals
    const addForm = useForm<AddStudentValues>({
        resolver: zodResolver(addStudentSchema),
        defaultValues: { firstName: "", middleName: "", lastName: "", gender: "Female", classId: null },
    });
    const editForm = useForm<EditStudentValues>({
        resolver: zodResolver(editStudentSchema),
        defaultValues: { id: "", firstName: "", middleName: "", lastName: "", gender: "Female", status: "active", classId: null },
    });

    // Open the add student modal
    function openAddDialog() {
        if (!canManage) return;
        addForm.reset({ firstName: "", middleName: "", lastName: "", gender: "Female", classId: null });
        setIsAddOpen(true);
    }

    // Open the edit student modal
    function openEditDialog(s: getSingleStudent) {
        if (!canManage) return;
        setEditingStudentId(s.id);
        editForm.reset({
            id: s.id,
            firstName: s.firstName,
            middleName: s.middleName ?? "",
            lastName: s.lastName,
            gender: s.gender === "MALE" ? "Male" : "Female",
            status: s.status.toLowerCase() as EditStudentValues["status"],
            classId: s.classId ?? null,
        });
        setIsEditOpen(true);
    }

    // Open the delete student dialog
    function openDeleteDialog(s: getSingleStudent) {
        if (!canManage) return;
        setStudentToDelete(s);
    }

    // Add student handler
    async function addStudentHandler(values: AddStudentValues) {
        if (!canManage) return;
        // Trim the values
        const firstName = values.firstName.trim();
        const middleName = values.middleName?.trim() ?? "";
        const lastName = values.lastName.trim();

        // Check if the student already exists in the local state
        const exists = studentList.some(
            (s) =>
                s.firstName.toLowerCase() === firstName.toLowerCase() &&
                (s.middleName ?? "").toLowerCase() === middleName.toLowerCase() &&
                s.lastName.toLowerCase() === lastName.toLowerCase(),
        );
        if (exists) {
            toast.error("A student with this name already exists");
            return;
        }
        // Try to create the student
        try {
            const { error } = await createStudent({
                firstName,
                middleName: values.middleName?.trim() || undefined,
                lastName,
                gender: values.gender.toUpperCase() as "MALE" | "FEMALE",
                classId: values.classId ?? null,
            });
            if (error) { throw error; }
            setIsAddOpen(false);
            addForm.reset({ firstName: "", middleName: "", lastName: "", gender: "Female", classId: null });
            toast.success(`Student "${getDisplayName({ firstName, middleName, lastName })}" added successfully`);
        } catch (error) {
            const mutationErr = createStudentError || error;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, "Failed to add student. Please try again."));
            }
        }
    }

    // Update student handler
    async function updateStudentHandler(values: EditStudentValues) {
        if (!canManage) return;
        // Check if the form is dirty
        const isDirty = editForm.formState.isDirty;
        if (editingStudentId === null || !isDirty) {
            toast.error("No student selected to update");
            return;
        }
        // Trim the values
        const firstName = values.firstName.trim();
        const middleName = values.middleName?.trim() ?? "";
        const lastName = values.lastName.trim();
        // Check if the student already exists in the local state
        const exists = studentList.some(
            (s) =>
                s.id !== editingStudentId &&
                s.firstName.toLowerCase() === firstName.toLowerCase() &&
                (s.middleName ?? "").toLowerCase() === middleName.toLowerCase() &&
                s.lastName.toLowerCase() === lastName.toLowerCase(),
        );
        // If the student already exists, show an error
        if (exists) {
            toast.error("A student with this name already exists");
            return;
        }
        // Try to update the student
        try {
            const { error } = await updateStudent({
                id: values.id,
                firstName,
                middleName: values.middleName?.trim() || undefined,
                lastName,
                gender: values.gender.toUpperCase() as "MALE" | "FEMALE",
                status: values.status.toUpperCase() as "ACTIVE" | "INACTIVE",
                classId: values.classId !== undefined ? values.classId : undefined,
            });
            if (error) { throw error; }
            setIsEditOpen(false);
            setEditingStudentId(null);
            toast.success(`Student "${getDisplayName({ firstName, middleName, lastName })}" updated successfully`);
        } catch (error) {
            const mutationErr = updateStudentError || error;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, "Failed to update student. Please try again."));
            }
        }
    }

    // Delete student handler
    async function deleteStudentHandler() {
        if (!canManage || !studentToDelete) return;
        const displayName = getDisplayName({
            firstName: studentToDelete.firstName,
            middleName: studentToDelete.middleName ?? "",
            lastName: studentToDelete.lastName,
        });
        // Try to delete the student
        try {
            const { error } = await deleteStudent({ id: studentToDelete.id });
            if (error) { throw error; }
            setStudentToDelete(null);
            toast.success(`Student "${displayName}" deleted successfully`);
        } catch (error) {
            const mutationErr = deleteStudentError || error;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, "Failed to delete student. Please try again."));
            }
        }
    }

    // Loading states
    const addLoading = addForm.formState.isSubmitting || isCreatingStudent;
    const editLoading = editForm.formState.isSubmitting || isUpdatingStudent;
    const deleteLoading = isDeletingStudent;
    const isMutating = addLoading || editLoading || deleteLoading;
    const controlsDisabled = isMutating || isStudentsInitialLoading || !!studentsError || studentList.length === 0;

    return (
        <>
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Students</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Add student modal */}
            <AddStudentModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                addForm={addForm}
                onSubmit={addStudentHandler}
                readOnly={!canManage}
                loading={addLoading}
                classOptions={classOptions}
            />

            {/* Edit student modal */}
            <EditStudentModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                editForm={editForm}
                onSubmit={updateStudentHandler}
                readOnly={!canManage}
                loading={editLoading}
                classOptions={classOptions}
            />

            {/* Delete confirmation */}
            <ConfirmDialog
                open={studentToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !deleteLoading) setStudentToDelete(null);
                }}
                title="Delete student?"
                description={
                    studentToDelete
                        ? `Delete "${getDisplayName({
                            firstName: studentToDelete.firstName,
                            middleName: studentToDelete.middleName ?? "",
                            lastName: studentToDelete.lastName,
                        })}"? This cannot be undone. Students enrolled in subjects cannot be deleted until those enrollments are removed.`
                        : "Delete this student? This cannot be undone."
                }
                confirmLabel="Delete Student"
                loading={deleteLoading}
                disabled={!studentToDelete}
                onConfirm={deleteStudentHandler}
            />

            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">
                        {/* All Students title and add button */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* Title and description */}
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-foreground md:text-lg">
                                    All Students ({studentList.length})
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Manage students and assign them to classes.
                                </p>
                            </div>
                            {canManage && (
                                <Button
                                    type="button"
                                    onClick={openAddDialog}
                                    className="h-10 cursor-pointer whitespace-nowrap md:h-12"
                                    disabled={isMutating || isStudentsInitialLoading || !!studentsError}
                                >
                                    Add Student
                                </Button>
                            )}
                        </div>

                        <hr className="my-3" />

                        {/* If students are loading and there is no cached data, show the skeleton */}
                        {isStudentsInitialLoading ? (
                            <StudentsLoadingTable />
                        ) : studentsError ? (
                            // If there is an error loading students, show the error banner
                            <ErrorBanner
                                title="Could not load students"
                                message={getApiErrorMessage(studentsError, "Failed to load students. Please try again.")}
                                onRetry={retryAllFetches}
                            />
                        ) : (
                            <div className="space-y-4">
                                {/* Auxiliary class fetch failure — classes are used by modals, not the table */}
                                {classesError ? (
                                    <ErrorBanner
                                        title="Could not load class options"
                                        message={getApiErrorMessage(
                                            classesError,
                                            "Failed to load classes for assignment. Please try again.",
                                        )}
                                        onRetry={retryAllFetches}
                                    />
                                ) : null}

                                {studentList.length === 0 ? (
                                    // If there are no students after loading, show the empty no entry component
                                    <EmptyNoEntry
                                        embedded
                                        title="No students yet"
                                        description="Add students to your school so they can be enrolled in classes."
                                        actionLabel={canManage ? "Add Student" : undefined}
                                        onAction={canManage ? openAddDialog : undefined}
                                    />
                                ) : (
                                    // Finally, if there are students, show the students table
                                    <div className="py-3">
                                        <StudentsTable
                                            students={studentList}
                                            classOptions={classOptions}
                                            canManage={canManage}
                                            isMutating={isMutating}
                                            disabled={controlsDisabled}
                                            onEditStudent={openEditDialog}
                                            onDeleteStudent={openDeleteDialog}
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
