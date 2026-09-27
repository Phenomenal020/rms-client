"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { DataTable, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";
import type { TeacherMember } from "./teachers-form";

// Teacher table props
type TeachersTableProps = {
    teachers: TeacherMember[];
    canManage: boolean;
    currentUserId?: string;
    addLoading: boolean;
    disabled?: boolean;
    onViewTeacher: (teacher: TeacherMember) => void;
};
export function TeachersTable({
    teachers,
    canManage,
    currentUserId,
    addLoading,
    disabled = false,
    onViewTeacher,
}: TeachersTableProps) {

    // define columns of your table
    const columns = useMemo(
        () =>
            [
                // Name column: sortable, filterable, and searchable
                {
                    accessorKey: "name",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Name"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    filterFn: (row, _id, value: string) => {
                        const query = value.toLowerCase();
                        return (
                            (row.original.name ?? "").toLowerCase().includes(query) ||
                            (row.original.email ?? "").toLowerCase().includes(query)
                        );
                    },
                    cell: ({ row }) => (
                        <span className="inline-flex py-1 font-medium text-foreground">
                            {row.original.name}
                        </span>
                    ),
                },
                // Email column: sortable, filterable, and searchable
                {
                    accessorKey: "email",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Email"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="block truncate text-muted-foreground">
                            {row.original.email}
                        </span>
                    ),
                },
                // Actions column: hidden by default
                {
                    id: "actions",
                    enableSorting: false,
                    enableHiding: false,
                    header: () => <span className="sr-only">Actions</span>,
                    cell: ({ row }) => {
                        // Get the teacher object from the row. If the user can not make changes, return null.
                        const teacher = row.original;
                        if (!canManage) {
                            return null;
                        }
                        // If the teacher is the current user, show a message saying "You"
                        if (teacher.id === currentUserId) {
                            return (
                                <div className="flex items-center justify-end">
                                    <span className="inline-flex h-8 items-center bg-secondary/60 px-2.5 text-sm font-medium text-muted-foreground">
                                        You
                                    </span>
                                </div>
                            );
                        }
                        // If the user is not the current user and can make changes, show the view button for further actions.
                        return (
                            <div className="flex items-center justify-end gap-1">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onViewTeacher(teacher)}
                                    disabled={addLoading}
                                    className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm"
                                    aria-label="View teacher"
                                >
                                    <Pencil className="h-3 w-3" />
                                    <span className="hidden sm:inline">View</span>
                                </Button>
                            </div>
                        );
                    },
                },
            ] satisfies ColumnDef<typeof TABLE_FEATURES, TeacherMember>[],
        [addLoading, canManage, currentUserId, onViewTeacher],
    );

    // Finally, render the teachers table with meaningful defaults
    return (
        <DataTable
            data={teachers}
            columns={columns}
            getRowId={(row) => row.id}
            searchColumn="name"
            searchPlaceholder="Search…"
            columnLabels={{
                name: "Name",
                email: "Email",
            }}
            pageSize={10}
            defaultSorting={[{ id: "name", desc: false }]}
            emptyMessage="No teachers match your search."
            disabled={disabled}
        />
    );
}