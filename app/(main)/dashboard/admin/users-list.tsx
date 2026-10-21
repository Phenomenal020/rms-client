import { Input } from "@/shadcn/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { Card, CardContent } from "@/shadcn/ui/card";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { EmptySearch } from "@/shared-components/empty-search";
import { Button } from "@/shadcn/ui/button";
import { Pencil } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { AdminUsersTableSkeleton } from "./admin-dashboard";
import type { UserRole, AppUser } from "./admin-dashboard";

// Props interface for UsersList
interface UsersListProps {
    canManage: boolean;
    users: AppUser[];
    searchQuery: string;
    loading: boolean;
    setSearchQuery: (query: string) => void;
    filteredUsers: AppUser[];
    setRoleFilter: (filter: UserRole | "ALL") => void;
    roleFilter: UserRole | "ALL";
    usersError: string | null;
    getPlatformUsers: () => void;
    openEditUserDialog: (user: AppUser) => void;
    setAccessingUser: (user: AppUser) => void;
    setAccessUserOpen: (open: boolean) => void;
}


export function UsersList({ canManage, users, searchQuery, loading, setSearchQuery, filteredUsers, setRoleFilter, roleFilter, usersError, getPlatformUsers, openEditUserDialog, setAccessingUser, setAccessUserOpen }: UsersListProps) {
    return (
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
                            message={usersError ?? "Failed to load users. Please try again."}
                            onRetry={() => void getPlatformUsers()}
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
    );
}