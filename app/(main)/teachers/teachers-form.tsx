"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { TeacherModal } from "./add-teacher-modal";
import { EditTeacherModal } from "./edit-teacher-modal";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { useUser } from "@/contexts/user-context";
import { TeachersTable } from "./teachers-table";
import { getOrgMembers, ORG_MEMBERS_KEY } from "@/fetcher/queries";
import { getApiErrorMessage, getHttpStatus, useAddMember } from "@/fetcher/mutations";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { authClient } from "@/src/auth-client";
import type { teacherOption } from "@/types/classes";
import { TeachersLoadingTable } from "./teachers-loading-table";

// Add Member Schema — email only; the member's name comes from their BA profile
const addTeacherSchema = z.object({
    email: z.email({ message: "Valid email is required" }),
});
export type AddTeacherValues = z.infer<typeof addTeacherSchema>;
export type TeacherMember = Pick<teacherOption, "id" | "name" | "email">;

export function TeachersForm() {
    // Router for redirection, mutate for manual retry
    const router = useRouter();
    const pathname = usePathname();
    const { mutate } = useSWRConfig();

    // Check the user is an org admin with 2FA and a verified email
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && user?.twoFactorEnabled === true && user?.emailVerified === true;

    // Dialog and search state
    const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<TeacherMember | null>(null);

    // Fetch organisation members
    const { teachers, error: membersError, isLoading: isLoadingMembers } = getOrgMembers();
    const teacherList = (teachers ?? []) as teacherOption[];

    // Add teacher mutation hook
    const { addMemberClient, isMutating: isAddingMember } = useAddMember();

    // Add teacher form with resolver and default values
    const addForm = useForm<AddTeacherValues>({
        resolver: zodResolver(addTeacherSchema),
        defaultValues: { email: "" },
    });

    // Retry fetching organisation members (manual retry logic)
    function retryAllFetches() {
        void mutate(ORG_MEMBERS_KEY);
    }

    // Redirect on auth errors
    useEffect(() => {
        if (!membersError) return;
        const status = getHttpStatus(membersError);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [membersError, router, pathname]);

    // Open add/edit teacher dialogs
    function openAddTeacherDialog() {
        if (!canManage) return;
        addForm.reset({ email: "" });
        setIsTeacherDialogOpen(true);
    }
    function openEditTeacherDialog(teacher: TeacherMember) {
        if (!canManage) return;
        setEditingTeacher(teacher);
        setIsEditDialogOpen(true);
    }

    // Add teacher handler
    async function addMember(formData: AddTeacherValues) {
        if (!canManage) return;
        const normalisedEmail = formData.email.trim().toLowerCase();
        if (teacherList.some((teacher) => teacher.email.toLowerCase() === normalisedEmail)) {
            addForm.setError("email", { message: "A teacher with this email already exists" });
            return;
        }
        try {
            const { error } = await addMemberClient({ email: normalisedEmail });
            if (error) throw error;
            void mutate(ORG_MEMBERS_KEY);
            setIsTeacherDialogOpen(false);
            toast.success(`${normalisedEmail} added to the organisation.`);
            addForm.reset();
        } catch (err) {
            if (!handleAuthRedirect(err, { router, pathname })) {
                toast.error(getApiErrorMessage(err, "Failed to add teacher. Please try again."));
            }
        }
    }

    // Remove teacher handler
    async function removeMember(email: string) {
        if (!canManage) return;
        try {
            const { error } = await authClient.organization.removeMember({
                memberIdOrEmail: email,
            });
            if (error) throw error;  //if error, throw it
            void mutate(ORG_MEMBERS_KEY);
            setIsEditDialogOpen(false);
            setEditingTeacher(null);
            toast.success("Member removed from organisation.");
        } catch (err) { // catch the error here
            if (!handleAuthRedirect(err, { router, pathname })) {
                toast.error(getApiErrorMessage(err, "Failed to remove member. Please try again."));
            }
        }
    }

    // Loading state and disabled controls
    const addLoading = isAddingMember || addForm.formState.isSubmitting;
    const controlsDisabled = addLoading || isLoadingMembers || !!membersError || teacherList.length === 0;

    return (
        <>
            {/* Teachers Header Text and Small Term Text */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Teachers</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Add teacher modal */}
            <TeacherModal
                open={isTeacherDialogOpen}
                onOpenChange={setIsTeacherDialogOpen}
                form={addForm}
                addMember={addMember}
                loading={addLoading}
                readOnly={!canManage}
            />

            {/* Edit / view teacher modal */}
            <EditTeacherModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                teacher={editingTeacher}
                removeMember={removeMember}
                canManage={canManage}
                user={user}
            />

            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">
                        {/* All Teachers title and add teacher button */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* Title and description */}
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-foreground md:text-lg">
                                    All Teachers ({teacherList.length})
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Manage teachers in your organisation.
                                </p>
                            </div>
                            {canManage && (
                                <Button
                                    type="button"
                                    className="h-10 w-fit cursor-pointer md:h-12 sm:self-center"
                                    onClick={openAddTeacherDialog}
                                    disabled={addLoading || isLoadingMembers || !!membersError}
                                >
                                    <Plus className="h-4 w-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Add Teacher</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                            )}
                        </div>
                        <hr className="my-3" />

                        {/* If teachers are loading and there is no cached data, show the skeleton */}
                        {isLoadingMembers && teacherList.length === 0 ? (
                            <TeachersLoadingTable />
                        ) : membersError ? (
                            // If there is an error loading teachers, show the error banner
                            <ErrorBanner
                                title="Could not load teachers"
                                message={getApiErrorMessage(
                                    membersError,
                                    "Failed to load organisation members. Please try again.",
                                )}
                                onRetry={retryAllFetches}
                            />
                        ) : teacherList.length === 0 ? (
                            // If there are no teachers after loading, show the empty no entry component
                            <EmptyNoEntry
                                embedded
                                title="No teachers yet"
                                description={
                                    "No teachers have been added to your organisation yet."
                                }
                                actionLabel={canManage ? "Add Teacher" : undefined}
                                onAction={canManage ? openAddTeacherDialog : undefined}
                            />
                        ) : (
                            // Finally, if there are teachers, show the teachers table
                            <div className="py-3">
                                <TeachersTable
                                    teachers={teacherList}
                                    canManage={canManage}
                                    currentUserId={user?.id}
                                    addLoading={addLoading}
                                    disabled={controlsDisabled}
                                    onViewTeacher={openEditTeacherDialog}
                                />
                            </div>
                        )}
                    </section>
                </CardContent>
            </Card>
        </>
    );
}