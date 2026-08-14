"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Check, Pencil, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/shadcn/ui/popover";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EditEnrollmentModal } from "./edit-enrollment-modal";
import { EnrollmentLoadingTable } from "./enrollment-loading-table";
import { cn } from "@/lib/utils";
import { subjectClassAssignmentPayload, subjectAssignment } from "@/types/enrollments";
import { getApiErrorMessage, getHttpStatus, useSaveEnrollment } from "@/fetcher/mutations";
import { getEnrollments, getSubjectClassAssignments, getTerms } from "@/fetcher/queries";
import { useUser } from "@/contexts/user-context";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { enrollmentPayload } from "@/types/students";
import { singleTermPayload } from "@/types/term";
import { handleAuthRedirect } from "@/utils/auth-redirect";

export type EnrollmentStudent = {
    studentId: string;
    name: string;
    enrolledSubjectIds: string[];
};

//  Component
export function EnrollmentForm() {
    // hooks for redirection
    const router = useRouter();
    const pathname = usePathname();
    // to manually invalidate the cache
    const { mutate } = useSWRConfig();

    // Org admin gate — disable management features for non-orgadmin users
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && user?.twoFactorEnabled === true;

    // Active term — required for class assignments and enrollments
    const { data: termsData, error: termsError, isLoading: isLoadingTerms } = getTerms();
    const activeTermId = (termsData as singleTermPayload[] | undefined)?.find((term) => term.status === "ACTIVE")?.id ?? null;
    // Get classes for that term: For the classes dropdown
    const { data: classes = [], error: classesError, isLoading: isLoadingClasses } = getSubjectClassAssignments(activeTermId);

    // State management: class selector
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    // editing student, edit modal open state
    const [editingStudent, setEditingStudent] = useState<EnrollmentStudent | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    // Open/Close the class picker dropdown
    const [classPickerOpen, setClassPickerOpen] = useState(false);
    // class search query
    const [searchQuery, setSearchQuery] = useState("");

    // fetch enrollments for the selected class and term
    const { data: enrollmentsData = [], error: enrollmentsError, isLoading: isLoadingStudents } = getEnrollments(selectedClassId, activeTermId);

    // save enrollment mutation
    const { trigger: triggerSaveEnrollment, isMutating: isSavingEnrollment, error: saveEnrollmentError } = useSaveEnrollment();

    const classList = classes as subjectClassAssignmentPayload[];
    const enrollmentList = (enrollmentsData ?? []) as enrollmentPayload[];

    // Error handling: split critical (terms) vs auxiliary (classes) vs class-scoped (enrollments)
    const criticalLoadError = termsError;
    const auxiliaryLoadError = classesError;
    const enrollmentsLoadError = selectedClassId ? enrollmentsError : undefined;
    const loadError = criticalLoadError ?? auxiliaryLoadError ?? enrollmentsLoadError;

    // try again: retry all fetches
    function retryAllFetches() {
        void mutate("/api/v1/terms");
        void mutate(
            (key) => typeof key === "string" && key.startsWith("/api/v1/classes/enrollments"),
        );  // mutate the subject class assignments cache
        if (selectedClassId && activeTermId) {
            void mutate(
                `/api/v1/students/enrollments?classId=${encodeURIComponent(selectedClassId)}&termId=${encodeURIComponent(activeTermId)}`,
            );  // finally, mutate the enrollments cache which depends on the selected class and active term
        }
    }

    // handle authentication redirects based on the error status code
    useEffect(() => {
        const fetchError = termsError ?? classesError ?? enrollmentsError;
        if (!fetchError) return;
        const status = getHttpStatus(fetchError);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [termsError, classesError, enrollmentsError, router, pathname]);

    // Filter classes by search query
    const filteredClasses = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return q ? classList.filter((cls) => cls.name.toLowerCase().includes(q)) : classList;
    }, [classList, searchQuery]);

    // The selected class record (used to derive subjects for the modal)
    const selectedClass = classList.find((cls) => cls.classId === selectedClassId) ?? null;
    // Derive class assignments from the selected class
    const classAssignments: subjectAssignment[] = selectedClass?.assignments ?? [];

    // Map API students → EnrollmentStudent shape
    const studentsForClass: EnrollmentStudent[] = useMemo(() => {
        if (enrollmentList.length <= 0) return [];
        return enrollmentList.map((s) => ({
            studentId: s.student.studentId,
            name: [s.student.firstName, s.student.middleName ? s.student.middleName.charAt(0) + "." : "", s.student.lastName]
                .filter(Boolean)
                .join(" "),
            enrolledSubjectIds: s.enrollments.map((es) => es.assignmentId),
        }));
    }, [enrollmentList]);

    // Clear the editing student whenever the class changes
    useEffect(() => {
        setEditingStudent(null);
        setIsEditOpen(false);
    }, [selectedClassId]);

    // Open the edit enrollment modal
    function openEditDialog(student: EnrollmentStudent) {
        if (!canManage) return;  // if the user is not an orgadmin, return
        setEditingStudent(student);
        setIsEditOpen(true);
    }

    // Save enrollment handler
    async function saveEnrollmentHandler(studentId: string, enrolledSubjectIds: string[]) {
        if (!canManage) return;  // if the user is not an orgadmin, return
        if (!selectedClassId) {
            toast.error("No class selected. Please select a class first.");
            return;
        }
        if (!activeTermId) {
            toast.error("No active term. Please set up an active term first.");
            return;
        }
        try {
            await triggerSaveEnrollment({ studentId, enrolledSubjectIds, activeTermId });
            toast.success("Enrollment saved successfully");
            setIsEditOpen(false);
            // Revalidate the enrollments query for this class + term
            await mutate(
                `/api/v1/students/enrollments?classId=${encodeURIComponent(selectedClassId)}&termId=${encodeURIComponent(activeTermId)}`,
            );
        } catch (error) {
            const mutationErr = saveEnrollmentError || error;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, "Failed to save enrollment. Please try again."));
            }
        }
    }

    // loading states
    const isPageLoading = isLoadingTerms;
    const isStudentsLoading = !!selectedClassId && isLoadingStudents;

    return (
        <>
            {/* Edit Enrollment Modal */}
            <EditEnrollmentModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                student={editingStudent}
                classAssignments={classAssignments}
                onSave={saveEnrollmentHandler}
                readOnly={!canManage}
                isSavingEnrollment={isSavingEnrollment}
            />

            {/* Page Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Enrollment</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Main Card */}
            <Card className="border shadow-md">
                <CardContent className="space-y-6">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Header: title + class combobox */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className="text-base md:text-lg font-semibold text-foreground">
                                Class
                            </h4>

                            {/* Class selector — Popover + search (avoids base-ui/Radix asChild conflict) */}
                            <div className="w-full sm:max-w-xs">
                                <Popover open={classPickerOpen} onOpenChange={setClassPickerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={classPickerOpen}
                                            disabled={
                                                isLoadingClasses ||
                                                isPageLoading ||
                                                !activeTermId ||
                                                loadError !== undefined
                                            }
                                            className="h-10 md:h-12 w-full justify-between font-normal"
                                        >
                                            <span className="truncate">
                                                {isLoadingClasses || isPageLoading
                                                    ? "Loading classes..."
                                                    : classList.find((c) => c.classId === selectedClassId)?.name ??
                                                    "Select a class..."}
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        align="start"
                                        className="w-[--radix-popover-trigger-width] p-0"
                                    >
                                        {/* Search */}
                                        <div className="border-b p-2">
                                            <Input
                                                placeholder="Search classes..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="h-8 border-0 shadow-none focus-visible:ring-0"
                                            />
                                        </div>

                                        {/* Class list */}
                                        <div className="max-h-52 overflow-y-auto p-1">
                                            {filteredClasses.length === 0 ? (
                                                <p className="py-4 text-center text-sm text-muted-foreground">
                                                    No classes found
                                                </p>
                                            ) : (
                                                filteredClasses.map((cls) => (
                                                    <button
                                                        key={cls.classId}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedClassId(cls.classId);
                                                            setClassPickerOpen(false);
                                                            setSearchQuery("");
                                                        }}
                                                        className={cn(
                                                            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                            selectedClassId === cls.classId && "font-medium",
                                                        )}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "h-4 w-4 shrink-0",
                                                                selectedClassId === cls.classId ? "opacity-100" : "opacity-0",
                                                            )}
                                                        />
                                                        {cls.name}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Body: terms error, no active term, class/enrollment errors, loading, empty, table */}
                        {criticalLoadError ? (
                            <ErrorBanner
                                title="Could not load term data"
                                message={getApiErrorMessage(criticalLoadError, "Failed to load terms. Please try again.")}
                                onRetry={retryAllFetches}
                            />
                        ) : isPageLoading ? (
                            <EnrollmentLoadingTable />
                        ) : !activeTermId ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">
                                    No active term. Please set up an active term before managing enrollments.
                                </p>
                            </div>
                        ) : !selectedClassId ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">
                                    Select a class above to view and manage student enrollments.
                                </p>
                            </div>
                        ) : enrollmentsLoadError ? (
                            <ErrorBanner
                                title="Could not load enrollments"
                                message={getApiErrorMessage(
                                    enrollmentsLoadError,
                                    "Failed to load students for this class. Please try again.",
                                )}
                                onRetry={retryAllFetches}
                            />
                        ) : isStudentsLoading ? (
                            <EnrollmentLoadingTable />
                        ) : (
                            <div className="space-y-4">
                                {auxiliaryLoadError && (
                                    <ErrorBanner
                                        title="Could not load class options"
                                        message={getApiErrorMessage(
                                            auxiliaryLoadError,
                                            "Failed to load classes for this term. Please try again.",
                                        )}
                                        onRetry={retryAllFetches}
                                    />
                                )}
                                {studentsForClass.length === 0 ? (
                                    <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                        <p className="text-base font-medium text-muted-foreground">
                                            No students are assigned to this class yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto py-2">
                                        <table className="table-fixed min-w-[360px] w-full border-collapse text-sm md:text-base text-left">
                                            <colgroup>
                                                <col className="w-[10%]" />
                                                <col className="w-[46%]" />
                                                <col className="w-[34%]" />
                                                <col className="w-[10%]" />
                                            </colgroup>
                                            <thead>
                                                <tr className="bg-muted/50 border-b border-border">
                                                    <th className="p-2 font-semibold text-muted-foreground">S/N</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">Student</th>
                                                    <th className="p-2 font-semibold text-muted-foreground">
                                                        Enrolled Subjects
                                                    </th>
                                                    <th className="p-2 font-semibold text-muted-foreground" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentsForClass.map((student, index) => (
                                                    <tr
                                                        key={student.studentId}
                                                        className="border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors"
                                                    >
                                                        <td className="p-2 font-medium text-foreground">{index + 1}</td>

                                                        <td className="max-w-0 p-2 font-medium text-foreground">
                                                            <span className="block truncate" title={student.name}>
                                                                {student.name}
                                                            </span>
                                                        </td>

                                                        <td className="max-w-0 p-2">
                                                            {student.enrolledSubjectIds.length === 0 ? (
                                                                <span className="italic text-xs text-muted-foreground">
                                                                    None enrolled
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                                    <BookOpen className="h-3 w-3" />
                                                                    {`${student.enrolledSubjectIds.length} subject${student.enrolledSubjectIds.length !== 1 ? "s" : ""}`}
                                                                </span>
                                                            )}
                                                        </td>

                                                        {canManage && (
                                                            <td className="p-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openEditDialog(student)}
                                                                    disabled={
                                                                        isSavingEnrollment ||
                                                                        loadError !== undefined ||
                                                                        isStudentsLoading
                                                                    }
                                                                    className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300"
                                                                    aria-label="Edit enrollment"
                                                                >
                                                                    <Pencil className="h-3 w-3" />
                                                                    <span className="hidden md:inline">Edit</span>
                                                                </Button>
                                                            </td>
                                                        )}
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