"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { authClient } from "@/src/auth-client";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { EditUserModal } from "./edit-user-modal";
import { AccessUserModal } from "./access-user-modal";
import { OnboardingRequests } from "./onboarding-requests";
import { DashboardSessions } from "../helpers/dashboard-sessions";
import { useUser } from "@/contexts/user-context";
import Profile from "../(profile)/profile";
import { UsersList } from "./users-list";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

// Types for user's role and data
export type UserRole = "admin" | "orgadmin" | "user";
export type AppUser = {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string | null;
    lastName?: string | null;
    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: Date | string | null;
    twoFactorEnabled?: boolean | null;
};

// Main Admin Dashboard component
export function AdminDashboard() {
    // State for platform users, loading, error, search query, and role filter
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

    // Router for handling redirects
    const router = useRouter();
    const pathname = usePathname();

    // Check the user is an admin and has two-factor enabled to be able to save changes
    const { user } = useUser();
    const canManage = user?.role === "admin" && user.twoFactorEnabled === true;

    // Edit user modal state
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AppUser | null>(null);

    // Access user modal state
    const [accessUserOpen, setAccessUserOpen] = useState(false);
    const [accessingUser, setAccessingUser] = useState<AppUser | null>(null);

    // Fetch platform users (withSkeleton avoids flashing the table on background refresh)
    const getPlatformUsers = useCallback(async ({ withSkeleton = false } = {}) => {
        // Reset error and loading state (to true)
        setUsersError(null);
        if (withSkeleton) setLoading(true);
        // Make the api call to get all platform users
        try {
            const { data, error: listUsersError } = await authClient.admin.listUsers({ query: {} });
            if (data) {
                setUsers(data.users as AppUser[]);
            } else if (listUsersError) {
                // If there is an error, check the status code to see if it is a 401 or 403 and handle the redirect accordingly
                if (handleAuthRedirect(listUsersError, { router, pathname })) {
                    return;
                }
                // Otherwise, simply show the error message
                setUsersError(listUsersError.message ?? "Failed to load users. Please try again.");
            }
        } catch {
            setUsersError("Failed to load users. Please try again.");
        } finally {
            if (withSkeleton) setLoading(false);
        }
    }, [router, pathname]);

    // Fetch platform users on mount
    useEffect(() => {
        void getPlatformUsers({ withSkeleton: true });
    }, [getPlatformUsers]);

    // Filtered users for the table
    const filteredUsers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return users.filter((u) => {
            const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
            const matchesSearch =
                !q ||
                u.email.toLowerCase().includes(q) ||
                (u.firstName ?? "").toLowerCase().includes(q) ||
                (u.lastName ?? "").toLowerCase().includes(q);
            return matchesRole && matchesSearch;
        });
    }, [users, searchQuery, roleFilter]);

    // Open the edit modal for the selected user
    function openEditUserDialog(selectedUser: AppUser) {
        setEditingUser(selectedUser);
        setEditUserOpen(true);
    }

    return (
        <>
            <Tabs defaultValue="users" className="pb-6 mt-10">
                {/* The tab triggers */}
                <TabsList variant="line">
                    <TabsTrigger value="users" className="cursor-pointer">All Users</TabsTrigger>
                    <TabsTrigger value="sessions" className="cursor-pointer">Sessions</TabsTrigger>
                    <TabsTrigger value="onboarding" className="cursor-pointer">Onboarding</TabsTrigger>
                    <TabsTrigger value="profile" className="cursor-pointer">Profile</TabsTrigger>
                </TabsList>

                {/* Tab content (x4) */}
                <TabsContent value="users" className="mt-5">
                    <UsersList canManage={canManage} users={users} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredUsers={filteredUsers} setRoleFilter={setRoleFilter} roleFilter={roleFilter} usersError={usersError} getPlatformUsers={getPlatformUsers} openEditUserDialog={openEditUserDialog} setAccessingUser={setAccessingUser} setAccessUserOpen={setAccessUserOpen} loading={loading} />
                </TabsContent>

                <TabsContent value="sessions" className="mt-5">
                    <DashboardSessions />
                </TabsContent>

                <TabsContent value="onboarding" className="mt-5">
                    <OnboardingRequests />
                </TabsContent>

                <TabsContent value="profile">
                    <Profile />
                </TabsContent>
            </Tabs>

            {/* Edit user modal */}
            <EditUserModal
                open={editUserOpen}
                onOpenChange={setEditUserOpen}
                onSuccess={() => void getPlatformUsers()}
                user={editingUser}
            />

            {/* Access user modal */}
            <AccessUserModal
                open={accessUserOpen}
                onOpenChange={setAccessUserOpen}
                onSuccess={() => void getPlatformUsers()}
                user={accessingUser}
            />
        </>
    );
}

const ADMIN_USERS_SKELETON_ROWS = 3;
// Loading placeholder matching the All Users table layout
export function AdminUsersTableSkeleton() {
    return (
        <div className="overflow-x-auto py-3" aria-busy="true" aria-label="Loading users">
            <table className="min-w-[560px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                <tbody>
                    {Array.from({ length: ADMIN_USERS_SKELETON_ROWS }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-5 sm:h-4 sm:w-6" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[65%] sm:h-4 sm:w-[70%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[65%] sm:h-4 sm:w-[70%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[75%] sm:h-4 sm:w-[85%]" />
                            </td>
                            <td className="p-2">
                                <div className="flex items-center justify-end gap-1">
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-16" />
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-16" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}