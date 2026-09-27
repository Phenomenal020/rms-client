"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { authClient } from "@/src/auth-client";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { Pencil, ShieldCheck } from "lucide-react";
import { EditUserModal } from "./edit-user-modal";
import { AccessUserModal } from "./access-user-modal";
import { OnboardingRequests } from "./onboarding-requests";
import { DashboardSessions } from "../helpers/dashboard-sessions";
import { useUser } from "@/contexts/user-context";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { EmptySearch } from "@/shared-components/empty-search";

type UserRole = "admin" | "orgadmin" | "user";

type AppUser = {
    id: string;
    email: string;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: Date | string | null;
    twoFactorEnabled?: boolean | null;
};

export function AdminDashboard() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

    // Check the user is an admin and has two-factor enabled
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
        setUsersError(null);
        if (withSkeleton) setLoading(true);

        try {
            const { data, error } = await authClient.admin.listUsers({ query: {} });
            if (data) {
                setUsers(data.users as AppUser[]);
            } else if (error) {
                setUsersError(error.message ?? "Failed to load users. Please try again.");
            }
        } catch {
            setUsersError("Failed to load users. Please try again.");
        } finally {
            if (withSkeleton) setLoading(false);
        }
    }, []);

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
            <Tabs defaultValue="users" className="pb-6">
                <TabsList variant="line">
                    <TabsTrigger value="users">All Users</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                    <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-5">
                    <Card className="border shadow-md">
                        <CardContent>
                            <section className="overflow-hidden rounded-sm bg-card">
                                {/* All Users title, search, and role filter */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    {/* Title and description */}
                                    <div className="space-y-1">
                                        <h4 className="text-base font-semibold text-foreground md:text-lg">
                                            All Users ({users.length})
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Manage platform users and their access.
                                        </p>
                                    </div>
                                    {/* Search and role filter */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search…"
                                            className="h-10 md:h-12 w-1/2 sm:max-w-xs text-sm"
                                            disabled={loading || users.length === 0}
                                        />
                                        <Select
                                            value={roleFilter}
                                            onValueChange={(v) => setRoleFilter(v as UserRole | "ALL")}
                                            disabled={loading || users.length === 0}
                                        >
                                            <SelectTrigger className="h-10 md:h-12 w-36 cursor-pointer">
                                                <SelectValue placeholder="All roles" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">All</SelectItem>
                                                <SelectItem value="admin">Admins</SelectItem>
                                                <SelectItem value="orgadmin">Org Admins</SelectItem>
                                                <SelectItem value="user">Users</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <hr className="my-3" />

                                {/* If users are loading and there is no cached data, show the skeleton */}
                                {loading && users.length === 0 ? (
                                    <AdminUsersTableSkeleton />
                                ) : usersError ? (
                                    // If there is an error loading users, show the error banner
                                    <ErrorBanner
                                        title="Could not load users"
                                        message={usersError}
                                        onRetry={() => void getPlatformUsers({ withSkeleton: users.length === 0 })}
                                    />
                                ) : users.length === 0 ? (
                                    // If there are no users after loading, show the empty no entry component
                                    <EmptyNoEntry
                                        embedded
                                        title="No users onboarded yet"
                                        description="Platform users will appear here once schools complete onboarding."
                                    />
                                ) : filteredUsers.length === 0 ? (
                                    // If search or role filter returns no results, show the empty search component
                                    <EmptySearch
                                        embedded
                                        query={searchQuery}
                                        onClear={() => {
                                            setSearchQuery("");
                                            setRoleFilter("ALL");
                                        }}
                                    />
                                ) : (
                                    // If there are users, show them in the table
                                    <div className="overflow-x-auto py-3">
                                        <table className="min-w-[560px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                                            {/* Table column widths */}
                                            <colgroup>
                                                <col className="w-[7%]" />
                                                <col className="w-[20%]" />
                                                <col className="w-[20%]" />
                                                <col className="w-[33%]" />
                                                <col className="w-[20%]" />
                                            </colgroup>
                                            {/* Table headers */}
                                            <thead>
                                                <tr className="bg-muted/50 border-b border-border">
                                                    <th className="p-2 text-left font-semibold text-muted-foreground">S/N</th>
                                                    <th className="p-2 text-left font-semibold text-muted-foreground">First Name</th>
                                                    <th className="p-2 text-left font-semibold text-muted-foreground">Last Name</th>
                                                    <th className="p-2 text-left font-semibold text-muted-foreground">Email</th>
                                                    <th className="p-2 text-right font-semibold text-muted-foreground">Actions</th>
                                                </tr>
                                            </thead>
                                            {/* Table rows */}
                                            <tbody>
                                                {filteredUsers.map((user, index) => (
                                                    <tr
                                                        key={user.id}
                                                        className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                                                    >
                                                        {/* S/N column */}
                                                        <td className="p-2 text-muted-foreground">{index + 1}</td>
                                                        {/* First name column */}
                                                        <td className="p-2">
                                                            <span className="block truncate font-medium text-foreground">
                                                                {user.firstName ?? "—"}
                                                            </span>
                                                        </td>
                                                        {/* Last name column */}
                                                        <td className="p-2">
                                                            <span className="block truncate font-medium text-foreground">
                                                                {user.lastName ?? "—"}
                                                            </span>
                                                        </td>
                                                        {/* Email column */}
                                                        <td className="p-2">
                                                            <span className="block truncate text-muted-foreground">
                                                                {user.email}
                                                            </span>
                                                        </td>
                                                        {/* Actions column */}
                                                        <td className="p-2">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    disabled={!canManage}
                                                                    size="sm"
                                                                    onClick={() => openEditUserDialog(user)}
                                                                    className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300"
                                                                    aria-label="Edit user"
                                                                >
                                                                    <Pencil className="h-3 w-3" />
                                                                    <span className="hidden sm:inline">Edit</span>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    disabled={!canManage}
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setAccessingUser(user);
                                                                        setAccessUserOpen(true);
                                                                    }}
                                                                    className="cursor-pointer border border-violet-500/25 bg-violet-500/10 text-violet-700 hover:bg-violet-500/15 dark:text-violet-300"
                                                                    aria-label="Manage access"
                                                                >
                                                                    <ShieldCheck className="h-3 w-3" />
                                                                    <span className="hidden sm:inline">Access</span>
                                                                </Button>
                                                            </div>
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
                </TabsContent>

                <TabsContent value="sessions" className="mt-5">
                    <DashboardSessions />
                </TabsContent>

                <TabsContent value="onboarding" className="mt-5">
                    <OnboardingRequests />
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
function AdminUsersTableSkeleton() {
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
