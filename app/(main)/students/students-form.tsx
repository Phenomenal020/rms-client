"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ErrorBanner } from "@/shared-components/error-banner";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";
import { AddStudentModal } from "./add-student-modal";
import { EditStudentModal } from "./edit-student-modal";
import { StudentsLoadingTable } from "./students-loading-table";
import { getApiErrorMessage, getHttpStatus, useCreateStudent, useUpdateStudent, useDeleteStudent } from "@/fetcher/mutations";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { getStudents, getClasses } from "@/fetcher/queries";
import { useUser } from "@/contexts/user-context";
import { useSWRConfig } from "swr";
import type { getSingleStudent } from "@/types/students";
import type { getClassPayload } from "@/types/classes";

// Add student schema
const addStudentSchema = z.object({
    firstName: z.string().trim().max(128, { message: "First name should not be more than 128 characters" }).min(1, { message: "First name is required" }),
    middleName: z.string().trim().max(128, { message: "Middle name should not be more than 128 characters" }).optional(),
    lastName: z.string().trim().max(128, { message: "Last name should not be more than 128 characters" }).min(1, { message: "Last name is required" }),
    gender: z.enum(["Male", "Female"], { message: "Gender is required" }),
    classId: z.string().nullable().optional(),
});
export type AddStudentValues = z.infer<typeof addStudentSchema>;

// Edit student schema extends addStudentSchema with id and status
const editStudentSchema = addStudentSchema.extend({
    id: z.string().trim().min(1, { message: "ID is required" }),
    status: z.enum(["active", "inactive"], { message: "Status is required" }),
});
export type EditStudentValues = z.infer<typeof editStudentSchema>;

// A lightweight type for class options passed to modals
export type ClassOption = { id: string; name: string };

// Helpers
// Convert server uppercase values to title case for display and form initialisation.
// e.g. "MALE" → "Male", "FEMALE" → "Female", "NONE" → "None"
function toTitleCase(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
// Format a student's display name with optional middle initial.
function getDisplayName(student: Pick<AddStudentValues, "firstName" | "middleName" | "lastName">) {
    const mid = student.middleName?.trim();
    const initial = mid ? ` ${mid.charAt(0).toUpperCase()}.` : "";
    return `${student.firstName.trim()}${initial} ${student.lastName.trim()}`;
}

export function StudentsForm() {
    // router to handle redirects
    const router = useRouter();
    const pathname = usePathname();
    // manually mutate the cache
    const { mutate } = useSWRConfig();

    // Org admin gate — disable management features for non-orgadmin users
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && !(user?.twoFactorEnabled === true) && user?.emailVerified === true;

    // Data fetchers
    const { data: students, error: studentsError, isLoading: isLoadingStudents, isValidating: isValidatingStudents } = getStudents();
    const { data: classes, error: classesError, isLoading: isLoadingClasses, isValidating: isValidatingClasses } = getClasses(null);  // get all classes 
    const studentList = (students ?? []) as getSingleStudent[];

    // Error handling: split critical (table) vs auxiliary (modals) fetch failures
    const criticalLoadError = studentsError;
    const auxiliaryLoadError = classesError;
    const loadError = criticalLoadError ?? auxiliaryLoadError;
    const showStudentCount = !studentsError && students !== undefined;

    // Mutation hooks
    const { trigger: createStudent, isMutating: isCreatingStudent, error: createStudentError } = useCreateStudent();
    const { trigger: updateStudent, isMutating: isUpdatingStudent, error: updateStudentError } = useUpdateStudent();
    const { trigger: deleteStudent, isMutating: isDeletingStudent, error: deleteStudentError } = useDeleteStudent();

    function retryAllFetches() {
        void mutate("/api/v1/students");
        void mutate("/api/v1/classes");
    }

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

    // Transform classes data to simple {id, name} options for selectors
    const classOptions: ClassOption[] = useMemo(
        () => (classes ?? []).map((c: getClassPayload) => ({ id: c.id, name: c.name })),
        [classes],
    );

    // Filtered students based on search query
    const [searchQuery, setSearchQuery] = useState("");
    const filteredStudents = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return studentList;
        return studentList.filter((s) => {
            const fullName = getDisplayName({
                firstName: s.firstName,
                middleName: s.middleName ?? "",
                lastName: s.lastName,
            }).toLowerCase();
            const className = classOptions.find((c) => c.id === s.classId)?.name ?? "";
            return fullName.includes(query) || s.gender.toLowerCase().includes(query) || className.toLowerCase().includes(query);
        });
    }, [studentList, searchQuery, classOptions]);

    // Add dialog state
    const [isAddOpen, setIsAddOpen] = useState(false);
    // Edit dialog state — track by student id to avoid index/filter mismatch
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<getSingleStudent | null>(null);

    // Add form
    const addForm = useForm<AddStudentValues>({
        resolver: zodResolver(addStudentSchema),
        defaultValues: { firstName: "", middleName: "", lastName: "", gender: "Female", classId: null },
    });

    // Edit form
    const editForm = useForm<EditStudentValues>({
        resolver: zodResolver(editStudentSchema),
        defaultValues: { id: "", firstName: "", middleName: "", lastName: "", gender: "Female", status: "active", classId: null },
    });

    // Open add dialog
    function openAddDialog() {
        if (!canManage) return;  // return early if the user is not an orgadmin
        addForm.reset({ firstName: "", middleName: "", lastName: "", gender: "Female", classId: null });
        setIsAddOpen(true);
    }

    // Open edit dialog — uses student object directly (avoids index/filter mismatch bug)
    function openEditDialog(s: getSingleStudent) {
        if (!canManage) return;  // return early if the user is not an orgadmin
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

    function openDeleteDialog(s: getSingleStudent) {
        if (!canManage) return;
        setStudentToDelete(s);
    }

    // Add a student
    async function addStudentHandler(values: AddStudentValues) {
        if (!canManage) return;  // return early if the user is not an orgadmin

        const firstName = values.firstName.trim();
        const middleName = values.middleName?.trim() ?? "";
        const lastName = values.lastName.trim();

        // Check existing students array if this student already exists (via all three names match)
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

        // finally, create the student
        try {
            await createStudent({
                firstName,
                middleName: values.middleName?.trim() || undefined,
                lastName,
                gender: values.gender.toUpperCase() as "MALE" | "FEMALE",
                classId: values.classId ?? null,
                // status is 'active' by default. This is set by server
            });
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

    // Update a student
    async function updateStudentHandler(values: EditStudentValues) {
        if (!canManage) return;

        const isDirty = editForm.formState.isDirty;
        if (editingStudentId === null || !isDirty) {
            toast.error("No student selected to update");
            return;
        }

        const firstName = values.firstName.trim();
        const middleName = values.middleName?.trim() ?? "";
        const lastName = values.lastName.trim();

        const exists = studentList.some(
            (s) =>
                s.id !== editingStudentId &&
                s.firstName.toLowerCase() === firstName.toLowerCase() &&
                (s.middleName ?? "").toLowerCase() === middleName.toLowerCase() &&
                s.lastName.toLowerCase() === lastName.toLowerCase(),
        );
        if (exists) {
            toast.error("A student with this name already exists");
            return;
        }

        try {
            await updateStudent({
                id: values.id,
                firstName,
                middleName: values.middleName?.trim() || undefined,
                lastName,
                gender: values.gender.toUpperCase() as "MALE" | "FEMALE",
                status: values.status.toUpperCase() as "ACTIVE" | "INACTIVE",
                // undefined = leave unchanged; null = remove from class; string = assign to class
                classId: values.classId !== undefined ? values.classId : undefined,
            });
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

    async function deleteStudentHandler() {
        if (!canManage || !studentToDelete) return;
        const displayName = getDisplayName({
            firstName: studentToDelete.firstName,
            middleName: studentToDelete.middleName ?? "",
            lastName: studentToDelete.lastName,
        });
        try {
            await deleteStudent({ id: studentToDelete.id });
            setStudentToDelete(null);
            toast.success(`Student "${displayName}" deleted successfully`);
        } catch (error) {
            const mutationErr = deleteStudentError || error;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, "Failed to delete student. Please try again."));
            }
        }
    }

    const addLoading = addForm.formState.isSubmitting || isCreatingStudent;
    const editLoading = editForm.formState.isSubmitting || isUpdatingStudent;
    const deleteLoading = isDeletingStudent;
    const isMutating = addLoading || editLoading || deleteLoading;
    const isComponentLoading = isLoadingStudents || isLoadingClasses;
    const isRefreshing = isValidatingStudents || isValidatingClasses;

    return (
        <>
            {/* Page Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Students</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Add Student Modal */}
            <AddStudentModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                addForm={addForm}
                onSubmit={addStudentHandler}
                readOnly={!canManage}
                loading={addLoading}
                classOptions={classOptions}
            />

            {/* Edit Student Modal */}
            <EditStudentModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                editForm={editForm}
                onSubmit={updateStudentHandler}
                readOnly={!canManage}
                loading={editLoading}
                classOptions={classOptions}
            />

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

            {/* Main Card */}
            <Card className="border shadow-md">
                <CardContent className="space-y-4">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Header: count + search + add */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className="text-base md:text-lg font-semibold text-foreground">
                                All Students{showStudentCount ? ` (${studentList.length})` : ""}
                            </h4>
                            <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, gender, or class..."
                                    className="h-10 md:h-12 w-full sm:max-w-xs"
                                    disabled={isMutating || loadError !== null || isComponentLoading || isRefreshing}
                                />
                                {canManage && (
                                    <Button
                                        type="button"
                                        onClick={openAddDialog}
                                        className="cursor-pointer whitespace-nowrap h-10 md:h-12"
                                        disabled={isMutating || loadError !== null || isComponentLoading || isRefreshing}
                                    >
                                        Add Student
                                    </Button>
                                )}
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Body: Error banner, loading table, empty, no-match, table */}
                        {criticalLoadError ? (
                            <ErrorBanner
                                title="Could not load students"
                                message={getApiErrorMessage(criticalLoadError, "Failed to load students. Please try again.")}
                                onRetry={retryAllFetches}
                            />
                        ) : isComponentLoading ? (
                            <StudentsLoadingTable />
                        ) : (
                            <div className="space-y-4">
                                {auxiliaryLoadError && (
                                    <ErrorBanner
                                        title="Could not load class options"
                                        message={getApiErrorMessage(auxiliaryLoadError, "Failed to load classes for assignment. Please try again.")}
                                        onRetry={retryAllFetches}
                                    />
                                )}
                                {studentList.length === 0 ? (
                                    <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                        <p className="text-base font-medium text-muted-foreground">
                                            No students yet. Please add students to continue.
                                        </p>
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="py-4 text-center text-sm text-muted-foreground">
                                        No students match your search.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto py-2">
                                        <table className="min-w-[400px] w-full border-collapse text-sm lg:text-base text-left">
                                            <colgroup>
                                                <col className="w-[8%]" />
                                                <col className="w-[32%]" />
                                                <col className="w-[22%]" />
                                                <col className="w-[14%]" />
                                                <col className="w-[24%]" />
                                            </colgroup>
                                            <thead>
                                                <tr className="bg-muted/50 border-b border-border">
                                                    <th className="p-2 font-semibold text-muted-foreground">S/N</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">Student</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">Class</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">Gender</th>
                                                    <th className="p-2 font-semibold text-muted-foreground text-right" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredStudents.map((s, index) => (
                                                    <tr
                                                        key={s.id}
                                                        className="border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors"
                                                    >
                                                        <td className="p-2 font-medium text-foreground">{index + 1}</td>

                                                        <td className="p-2 font-medium text-foreground">
                                                            <span className="block truncate">
                                                                {getDisplayName({
                                                                    firstName: s.firstName,
                                                                    middleName: s.middleName ?? "",
                                                                    lastName: s.lastName,
                                                                })}
                                                            </span>
                                                        </td>

                                                        <td className="p-2 text-foreground">
                                                            {classOptions.find((c) => c.id === s.classId)?.name ?? "Not Assigned"}
                                                        </td>

                                                        <td className="p-2 font-medium text-foreground">
                                                            <span className="block truncate">{toTitleCase(s.gender)}</span>
                                                        </td>

                                                        <td className="p-2 text-right">
                                                            {canManage && (
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => openEditDialog(s)}
                                                                        disabled={isMutating || loadError !== null || isComponentLoading || isRefreshing}
                                                                        className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm lg:text-base"
                                                                        aria-label="Edit student"
                                                                    >
                                                                        <Pencil className="h-3 w-3" />
                                                                        <span className="sr-only sm:not-sr-only">Edit</span>
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => openDeleteDialog(s)}
                                                                        disabled={isMutating || loadError !== null || isComponentLoading || isRefreshing}
                                                                        className="cursor-pointer border border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300 text-sm lg:text-base"
                                                                        aria-label="Delete student"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                        <span className="sr-only sm:not-sr-only">Delete</span>
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
                    </section>
                </CardContent>
            </Card>
        </>
    );
}