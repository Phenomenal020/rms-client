"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/shadcn/ui/popover";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { EditEnrollmentModal } from "./edit-enrollment-modal";
import { EnrollmentLoadingTable } from "./enrollment-loading-table";
import { EnrollmentTable } from "./enrollment-table";
import { cn } from "@/lib/utils";
import { subjectClassAssignmentPayload, subjectAssignment } from "@/types/enrollments";
import { getApiErrorMessage, getHttpStatus, useSaveEnrollment } from "@/fetcher/mutations";
import { getActiveTerm, getEnrollments, getSubjectClassAssignments, getTerms } from "@/fetcher/queries";
import { TERMS_KEY, classEnrollmentsKey, studentEnrollmentsKey } from "@/fetcher/keys";
import { useUser } from "@/contexts/user-context";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { enrollmentPayload } from "@/types/students";
import { handleAuthRedirect } from "@/utils/auth-redirect";

// Enrollment student type
export type EnrollmentStudent = {
    studentId: string;
    name: string;
    enrolledSubjectIds: string[];
};

// Enrollment form component
export function EnrollmentForm() {
    // For redirection and manual retries
    const router = useRouter();
    const pathname = usePathname();
    const { mutate } = useSWRConfig();

    // Org admin gate
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && !(user?.twoFactorEnabled === true) && user?.emailVerified === true;

    // Fetch terms, then class assignments for the active term
    const { data: activeTermData, error: activeTermError, isLoading: isLoadingActiveTerm } = getActiveTerm();
    const activeTermId = activeTermData?.id ?? null;
    const { data: classes, error: classesError, isLoading: isLoadingClasses } = getSubjectClassAssignments(activeTermId);

    // State for the selected class and editing student
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [editingStudent, setEditingStudent] = useState<EnrollmentStudent | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [classPickerOpen, setClassPickerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch enrollments for the selected class and active term
    const { data: enrollmentsData, error: enrollmentsError, isLoading: isLoadingStudents } = getEnrollments(selectedClassId, activeTermId);

    // Mutation hook to save an enrollment
    const { trigger: triggerSaveEnrollment, isMutating: isSavingEnrollment, error: saveEnrollmentError } = useSaveEnrollment();

    // Class list and enrollment list
    const classList = (classes ?? []) as subjectClassAssignmentPayload[];
    const enrollmentList = (enrollmentsData ?? []) as enrollmentPayload[];

    // Loading states
    const isTermsInitialLoading = isLoadingActiveTerm && activeTermData == null;
    const isClassesInitialLoading = Boolean(activeTermId) && isLoadingClasses && classes == null;
    const isStudentsInitialLoading = Boolean(selectedClassId) && isLoadingStudents && enrollmentsData == null;

    // Retry all fetches for terms, class options, and the selected class enrollments
    function retryAllFetches() {
        void mutate(TERMS_KEY);
        if (activeTermId) {
            void mutate(classEnrollmentsKey(activeTermId));
        }
        if (selectedClassId && activeTermId) {
            void mutate(studentEnrollmentsKey(selectedClassId, activeTermId));
        }
    }

    // Handle redirection errors
    useEffect(() => {
        const fetchError = activeTermError ?? classesError ?? enrollmentsError;
        if (!fetchError) return;
        const status = getHttpStatus(fetchError);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [activeTermError, classesError, enrollmentsError, router, pathname]);

    // Filter classes based on search query
    const filteredClasses = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return q ? classList.filter((cls) => cls.name.toLowerCase().includes(q)) : classList;
    }, [classList, searchQuery]);

    // Get the selected class and its assignments
    const selectedClass = classList.find((cls) => cls.classId === selectedClassId) ?? null;
    const classAssignments: subjectAssignment[] = selectedClass?.assignments ?? [];

    // Get the students for the selected class
    const studentsForClass: EnrollmentStudent[] = useMemo(() => {
        if (enrollmentList.length <= 0) return [];
        const allowedAssignmentIds = new Set(classAssignments.map((a) => a.assignmentId));
        return enrollmentList.map((s) => ({
            studentId: s.student.studentId,
            name: [s.student.firstName, s.student.middleName ? `${s.student.middleName.charAt(0)}.` : "", s.student.lastName]
                .filter(Boolean)
                .join(" "),
            enrolledSubjectIds: s.enrollments
                .map((es) => es.assignmentId)
                .filter((id) => allowedAssignmentIds.has(id)),
        }));
    }, [enrollmentList, classAssignments]);

    // Reset editing student and modal when the selected class changes
    useEffect(() => {
        setEditingStudent(null);
        setIsEditOpen(false);
    }, [selectedClassId]);

    // Open the edit enrollment modal
    function openEditDialog(student: EnrollmentStudent) {
        if (!canManage) return;
        setEditingStudent(student);
        setIsEditOpen(true);
    }

    // Save the enrollment
    async function saveEnrollmentHandler(studentId: string, enrolledSubjectIds: string[]) {
        if (!canManage) return;
        if (!selectedClassId) {
            toast.error("No class selected. Please select a class first.");
            return;
        }
        if (!activeTermId) {
            toast.error("No active term. Please set up an active term first.");
            return;
        }
        if (enrolledSubjectIds.length > 20) {
            toast.error("Maximum of 20 subject enrollments allowed per student");
            return;
        }
        try {
            await triggerSaveEnrollment({ studentId, enrolledSubjectIds, activeTermId });
            toast.success("Enrollment saved successfully");
            setIsEditOpen(false);
        } catch (error) {
            const mutationErr = saveEnrollmentError || error;
            if (!handleAuthRedirect(mutationErr, { router, pathname })) {
                toast.error(getApiErrorMessage(mutationErr, "Failed to save enrollment. Please try again."));
            }
        }
    }

    // Loading states for the class picker
    const isShellLoading = isTermsInitialLoading || isClassesInitialLoading;
    const classPickerDisabled = isShellLoading || !!activeTermError || (!!classesError && classList.length === 0);

    return (
        <>
            {/* Edit enrollment modal */}
            <EditEnrollmentModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                student={editingStudent}
                classAssignments={classAssignments}
                onSave={saveEnrollmentHandler}
                readOnly={!canManage}
                isSavingEnrollment={isSavingEnrollment}
            />

            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Enrollment</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">
                        {/* Class title and class picker */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* Title and description */}
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-foreground md:text-lg">
                                    Class{selectedClass ? `: ${selectedClass.name}` : ""}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Select a class to view and manage student subject enrollments.
                                </p>
                            </div>

                            {/* Class selector — Popover + search */}
                            <div className="w-full sm:max-w-xs">
                                <Popover open={classPickerOpen} onOpenChange={setClassPickerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={classPickerOpen}
                                            disabled={classPickerDisabled || !activeTermId}
                                            className="h-10 w-full justify-between font-normal md:h-12"
                                        >
                                            <span className="truncate">
                                                {isShellLoading
                                                    ? "Loading classes..."
                                                    : classList.find((c) => c.classId === selectedClassId)?.name ??
                                                      "Select a class…"}
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        align="start"
                                        className="w-[--radix-popover-trigger-width] p-0"
                                    >
                                        <div className="border-b p-2">
                                            <Input
                                                placeholder="Search classes…"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="h-8 border-0 shadow-none focus-visible:ring-0"
                                            />
                                        </div>

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

                        <hr className="my-3" />

                        {/* If terms are loading and there is no cached data, show the skeleton */}
                        {isTermsInitialLoading ? (
                            <EnrollmentLoadingTable />
                        ) : activeTermError ? (
                            // If there is an error loading terms, show the error banner
                            <ErrorBanner
                                title="Could not load term data"
                                message={getApiErrorMessage(activeTermError, "Failed to load terms. Please try again.")}
                                onRetry={retryAllFetches}
                            />
                        ) : !activeTermId ? (
                            // If there is no active term, show the empty no entry component
                            <EmptyNoEntry
                                embedded
                                title="No active term"
                                description="Set up an active term before managing enrollments."
                                actionLabel="Set up term"
                                actionHref="/term"
                            />
                        ) : isClassesInitialLoading ? (
                            // If class options are loading and there is no cached data, show the skeleton
                            <EnrollmentLoadingTable />
                        ) : !selectedClassId ? (
                            classesError ? (
                                // If class options failed to load, show the error banner
                                <ErrorBanner
                                    title="Could not load class options"
                                    message={getApiErrorMessage(
                                        classesError,
                                        "Failed to load classes for this term. Please try again.",
                                    )}
                                    onRetry={retryAllFetches}
                                />
                            ) : (
                                // If no class is selected yet, prompt the user to choose one
                                <EmptyNoEntry
                                    embedded
                                    title="Select a class"
                                    description="Choose a class above to view and manage student enrollments."
                                />
                            )
                        ) : isStudentsInitialLoading ? (
                            // If enrollments are loading and there is no cached data, show the skeleton
                            <EnrollmentLoadingTable />
                        ) : enrollmentsError ? (
                            // If there is an error loading enrollments for the selected class, show the error banner
                            <ErrorBanner
                                title="Could not load enrollments"
                                message={getApiErrorMessage(
                                    enrollmentsError,
                                    "Failed to load students for this class. Please try again.",
                                )}
                                onRetry={retryAllFetches}
                            />
                        ) : (
                            <div className="space-y-4">
                                {/* Auxiliary class fetch failure — class was selected before options failed */}
                                {classesError ? (
                                    <ErrorBanner
                                        title="Could not load class options"
                                        message={getApiErrorMessage(
                                            classesError,
                                            "Failed to load classes for this term. Please try again.",
                                        )}
                                        onRetry={retryAllFetches}
                                    />
                                ) : null}

                                {studentsForClass.length === 0 ? (
                                    // If there are no students for the selected class, show the empty no entry component
                                    <EmptyNoEntry
                                        embedded
                                        title="No students enrolled"
                                        description="No students are assigned to this class yet."
                                        actionLabel="Manage students"
                                        actionHref="/students"
                                    />
                                ) : (
                                    // Finally, if there are students, show the enrollment table
                                    <div className="py-3">
                                        <EnrollmentTable
                                            students={studentsForClass}
                                            canManage={canManage}
                                            isSaving={isSavingEnrollment}
                                            disabled={isSavingEnrollment}
                                            onEditEnrollment={openEditDialog}
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
