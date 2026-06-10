"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { TeacherModal } from "./add-teacher-modal";
import { EditTeacherModal } from "./edit-teacher-modal";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ErrorBanner } from "@/shared-components/error-banner";
import { useUser } from "@/contexts/user-context";
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
    // hooks for redirection
    const router = useRouter();
    const pathname = usePathname();
    // manually invalidate the cache
    const { mutate } = useSWRConfig();

    // fetch the user's role (gate orgadmin)
    const { user } = useUser();
    const canManage = user?.role === "orgadmin";

    // state for the dialog and search query
    const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    // state for the editing teacher
    const [editingTeacher, setEditingTeacher] = useState<TeacherMember | null>(null);

    // fetch the user's teachers
    const { teachers, error: membersError, isLoading: isLoadingMembers } = getOrgMembers();
    const teacherList = (teachers ?? []) as teacherOption[];
    // add a teacher mutation hook
    const { addMemberClient, isMutating } = useAddMember();

    // add a form hook
    const addForm = useForm<AddTeacherValues>({
        resolver: zodResolver(addTeacherSchema),
        defaultValues: { email: "" },
    });

    // loading and error state
    const loadError = membersError;
    const showTeacherCount = !membersError && teachers !== undefined;
    const isComponentLoading = isLoadingMembers;

    // retry all fetches
    function retryAllFetches() {
        void mutate(ORG_MEMBERS_KEY);
    }

    // handle authentication redirects based on the error status code
    useEffect(() => {
        if (!membersError) return;
        const status = getHttpStatus(membersError);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [membersError, router, pathname]);

    // filter the teachers based on the search query
    const filteredTeachers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return teacherList;
        return teacherList.filter((teacher) =>
            teacher.name.toLowerCase().includes(query) ||
            teacher.email.toLowerCase().includes(query),
        );
    }, [teacherList, searchQuery]);

    // open the add teacher dialog
    function openAddTeacherDialog() {
        if (!canManage) return;   // orgadmin gate
        addForm.reset({ email: "" });
        setIsTeacherDialogOpen(true);
    }

    // open the edit teacher dialog
    function openEditTeacherDialog(teacher: TeacherMember) {
        if (!canManage) return;   // orgadmin gate
        setEditingTeacher(teacher);
        setIsEditDialogOpen(true);
    }

    // add member handler
    async function addMember(formData: AddTeacherValues) {
        if (!canManage) return;   // orgadmin gate
        const normalisedEmail = formData.email.trim().toLowerCase();
        if (teacherList.some((teacher) => teacher.email.toLowerCase() === normalisedEmail)) {
            addForm.setError("email", { message: "A teacher with this email already exists" });
            return;
        }
        try {
            await addMemberClient({ email: normalisedEmail });
            toast.success(`${normalisedEmail} added to the organisation.`);
            setIsTeacherDialogOpen(false);
            addForm.reset();
        } catch (err) {
            if (!handleAuthRedirect(err, { router, pathname })) {
                toast.error(getApiErrorMessage(err, "Failed to add teacher. Please try again."));
            }
        }
    }

    // remove member handler
    async function removeMember(email: string) {
        if (!canManage) return;   // orgadmin gate
        const { error } = await authClient.organization.removeMember({
            memberIdOrEmail: email,
        });
        if (error) {
            if (!handleAuthRedirect(error, { router, pathname })) {
                toast.error(getApiErrorMessage(error, "Failed to remove member. Please try again."));
            }
            return;
        }
        setIsEditDialogOpen(false);
        setEditingTeacher(null);
        await mutate(ORG_MEMBERS_KEY);
        toast.success("Member removed from organisation.");
    }

    // add loading state
    const addLoading = isMutating || addForm.formState.isSubmitting;

    return (
        <>
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Teachers</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Add Teacher Modal */}
            <TeacherModal
                open={isTeacherDialogOpen}
                onOpenChange={setIsTeacherDialogOpen}
                form={addForm}
                addMember={addMember}
                loading={addLoading}
                readOnly={!canManage}
            />

            {/* Edit / View Teacher Modal */}
            <EditTeacherModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                teacher={editingTeacher}
                removeMember={removeMember}
                canManage={canManage}
            />

            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className="text-base font-semibold text-foreground md:text-lg">
                                All Teachers{showTeacherCount ? ` (${teacherList.length})` : ""}
                            </h4>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="h-10 md:h-12 w-full sm:max-w-xs"
                                    disabled={addLoading || loadError !== undefined || isComponentLoading}
                                />

                                {canManage && (
                                    <Button
                                        type="button"
                                        className="w-fit cursor-pointer h-10 md:h-12 sm:self-center"
                                        onClick={openAddTeacherDialog}
                                        disabled={addLoading || loadError !== undefined || isComponentLoading}
                                    >
                                        <Plus className="h-4 w-4 sm:mr-1" />
                                        <span className="hidden sm:inline">Add Teacher</span>
                                        <span className="sm:hidden">Add</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <hr className="my-4" />

                        {loadError ? (
                            <ErrorBanner
                                title="Could not load teachers"
                                message={getApiErrorMessage(loadError, "Failed to load organisation members. Please try again.")}
                                onRetry={retryAllFetches}
                            />
                        ) : isComponentLoading ? (
                            <TeachersLoadingTable />
                        ) : teacherList.length === 0 ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">
                                    No teachers in your organisation yet.
                                    {canManage ? " Use the Add Teacher button to add a teacher." : ""}
                                </p>
                            </div>
                        ) : filteredTeachers.length === 0 ? (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                No teachers match your search.
                            </div>
                        ) : (
                            <div className="overflow-x-auto py-3">
                                <table className="min-w-[300px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                                    <colgroup>
                                        <col className="w-[40%]" />
                                        <col className="w-[48%]" />
                                        <col className="w-[12%]" />
                                    </colgroup>
                                    {/* Table Header */}
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="p-2 text-left font-semibold text-muted-foreground">Name</th>
                                            <th className="p-2 text-left font-semibold text-muted-foreground">Email</th>
                                            <th className="p-2 text-right font-semibold text-muted-foreground"></th>
                                        </tr>
                                    </thead>
                                    {/* Table Body */}
                                    <tbody>
                                        {filteredTeachers.map((teacher) => (
                                            <tr
                                                key={teacher.id}
                                                className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                                            >
                                                <td className="p-2 whitespace-nowrap">
                                                    <span className="inline-flex py-1 font-medium text-foreground">
                                                        {teacher.name}
                                                    </span>
                                                </td>
                                                <td className="p-2 mr-1">
                                                    <span className="block truncate text-muted-foreground">
                                                        {teacher.email}
                                                    </span>
                                                </td>
                                                <td className="p-2">
                                                    {canManage && (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => openEditTeacherDialog(teacher)}
                                                                className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm"
                                                                aria-label="View teacher"
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                                <span className="hidden sm:inline">View</span>
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
                    </section>
                </CardContent>
            </Card>
        </>
    );
}