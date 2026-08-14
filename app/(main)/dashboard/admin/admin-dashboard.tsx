"use client";

import { useState, useMemo, useEffect } from "react";
import { authClient } from "@/src/auth-client";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Pencil, ShieldCheck } from "lucide-react";
import { EditUserModal } from "./edit-user-modal";
import { AccessUserModal } from "./access-user-modal";
import { OnboardingRequests } from "./onboarding-requests";
// import { RecordRequests } from "./record-requests";
import { DashboardSessions } from "../helpers/dashboard-sessions";
import { useUser } from "@/contexts/user-context";

// User role type for the admin dashboard
type UserRole = "admin" | "orgadmin" | "user";

// User type for the admin dashboard
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

// Admin dashboard component
export function AdminDashboard() {
    // State for the users
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

    // Gate admin action buttons
    const { user } = useUser();
    const canManage = user?.role === "admin" && user.twoFactorEnabled === true;

    // Edit user modal state
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AppUser | null>(null);

    // Access user modal state
    const [accessUserOpen, setAccessUserOpen] = useState(false);
    const [accessingUser, setAccessingUser] = useState<AppUser | null>(null);

    // Open the edit modal for the selected user
    function openEditUserDialog(user: AppUser) {
        setEditingUser(user);
        setEditUserOpen(true);
    }

    // Fetch platform users
    const getPlatformUsers = () => {   // for now, include the admin
        authClient.admin.listUsers({ query: {} }).then(({ data }) => {
            if (data) {
                setUsers(data.users as AppUser[]);
            }
        }).finally(() => {
            setLoading(false);
        });
    }

    // Effect to fetch the platform users on mount
    useEffect(() => {
        getPlatformUsers();
    }, []);

    // Filter the platform users based on search query or role filter
    const filteredUsers = useMemo(() => {
        const q = searchQuery.toLowerCase();
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

    return (
        <>
            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Table Header: All Users, search, and role filter */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* All Users title  */}
                            <h4 className="text-base font-semibold text-foreground md:text-lg">
                                All Users ({users.length})
                            </h4>
                            <div className="flex items-center gap-2">
                                {/* Text search */}
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="h-10 md:h-12 w-1/2 sm:max-w-xs"
                                    disabled={loading || users.length === 0}
                                />
                                {/* Role filter */}
                                <div className="flex-1">
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
                        </div>
                        <hr className="my-3" />

                        {/* Empty / Filtered-empty / Table */}
                        {loading ? (
                            <AdminUsersTableSkeleton />
                        ) : users.length === 0 ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">
                                    No users onboarded yet.
                                </p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                No users match your search.
                            </div>
                        ) : (
                            <div className="overflow-x-auto py-3">
                                {/* All Users table when users not empty */}
                                <table className="min-w-[560px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                                    <colgroup>
                                        <col className="w-[7%]" />
                                        <col className="w-[20%]" />
                                        <col className="w-[20%]" />
                                        <col className="w-[33%]" />
                                        <col className="w-[20%]" />
                                    </colgroup>
                                    {/* Table header row */}
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="p-2 text-left font-semibold text-muted-foreground">S/N</th>
                                            <th className="p-2 text-left font-semibold text-muted-foreground">First Name</th>
                                            <th className="p-2 text-left font-semibold text-muted-foreground">Last Name</th>
                                            <th className="p-2 text-left font-semibold text-muted-foreground">Email</th>
                                            <th className="p-2 text-right font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    {/* Table body (maps through the filtered users) */}
                                    <tbody>
                                        {filteredUsers.map((user, index) => (
                                            <tr
                                                key={user.id}
                                                className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                                            >
                                                {/* s/n */}
                                                <td className="p-2 text-muted-foreground">{index + 1}</td>
                                                {/* first name */}
                                                <td className="p-2">
                                                    <span className="block truncate font-medium text-foreground">
                                                        {user.firstName ?? "—"}
                                                    </span>
                                                </td>
                                                {/* last name */}
                                                <td className="p-2">
                                                    <span className="block truncate font-medium text-foreground">
                                                        {user.lastName ?? "—"}
                                                    </span>
                                                </td>
                                                {/* email */}
                                                <td className="p-2">
                                                    <span className="block truncate text-muted-foreground">
                                                        {user.email}
                                                    </span>
                                                </td>
                                                {/* actions */}
                                                <td className="p-2">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* edit user */}
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
                                                        {/* manage access */}
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            disabled={!canManage}
                                                            size="sm"
                                                            onClick={() => { setAccessingUser(user); setAccessUserOpen(true); }}
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

            {/* Edit User Modal */}
            <EditUserModal
                open={editUserOpen}
                onOpenChange={setEditUserOpen}
                onSuccess={getPlatformUsers}
                user={editingUser}
            />

            {/* Access User Modal */}
            <AccessUserModal
                open={accessUserOpen}
                onOpenChange={setAccessUserOpen}
                onSuccess={getPlatformUsers}
                user={accessingUser}
            />

            <DashboardSessions />

            <OnboardingRequests />
            {/* <RecordRequests /> */}
        </>
    );
}

const ADMIN_USERS_SKELETON_ROWS = 3;

// Loading placeholder matching the All Users table layout
function AdminUsersTableSkeleton() {
    return (
        <div className="overflow-x-auto py-3" aria-busy="true" aria-label="Loading users">
            <table className="min-w-[560px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                <colgroup>
                    <col className="w-[7%]" />
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                    <col className="w-[33%]" />
                    <col className="w-[20%]" />
                </colgroup>
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="p-2 text-left font-semibold text-muted-foreground">S/N</th>
                        <th className="p-2 text-left font-semibold text-muted-foreground">First Name</th>
                        <th className="p-2 text-left font-semibold text-muted-foreground">Last Name</th>
                        <th className="p-2 text-left font-semibold text-muted-foreground">Email</th>
                        <th className="p-2 text-right font-semibold text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: ADMIN_USERS_SKELETON_ROWS }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-4 w-6" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-4 w-[70%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-4 w-[70%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-4 w-[85%]" />
                            </td>
                            <td className="p-2">
                                <div className="flex items-center justify-end gap-1">
                                    <Skeleton className="h-8 w-16 rounded-md" />
                                    <Skeleton className="h-8 w-16 rounded-md" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}