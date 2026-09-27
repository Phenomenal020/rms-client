"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { DataTable, getPaginatedSerialNumber, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";
import { singleGetSubjectPayload } from "@/types/subjects";

// Subjects table props
type SubjectsTableProps = {
    subjects: singleGetSubjectPayload[];
    canManage: boolean;
    isMutating: boolean;
    disabled?: boolean;
    onEditSubject: (subject: singleGetSubjectPayload) => void;
    onDeleteSubject: (subject: singleGetSubjectPayload) => void;
};

export function SubjectsTable({
    subjects,
    canManage,
    isMutating,
    disabled = false,
    onEditSubject,
    onDeleteSubject,
}: SubjectsTableProps) {
    // define columns of your table
    const columns = useMemo(
        () =>
            [
                // S/N column: row number across pages
                {
                    id: "serial",
                    enableSorting: false,
                    enableHiding: false,
                    header: () => (
                        <span className="font-semibold text-muted-foreground">S/N</span>
                    ),
                    cell: ({ row, table }) => (
                        <span className="font-medium text-foreground">
                            {getPaginatedSerialNumber(row, table)}
                        </span>
                    ),
                },
                // Subject column: sortable, filterable, and searchable
                {
                    accessorKey: "name",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Subject"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    filterFn: (row, _id, value: string) => {
                        const query = value.toLowerCase();
                        return (
                            row.original.name.toLowerCase().includes(query) ||
                            row.original.department.toLowerCase().includes(query)
                        );
                    },
                    cell: ({ row }) => (
                        <span className="block truncate pr-2 text-sm font-medium text-foreground lg:text-base">
                            {row.original.name}
                        </span>
                    ),
                },
                // Department column: sortable
                {
                    accessorKey: "department",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Department"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="block truncate text-sm capitalize text-muted-foreground lg:text-base">
                            {row.original.department}
                        </span>
                    ),
                },
                // Actions column: edit and delete
                {
                    id: "actions",
                    enableSorting: false,
                    enableHiding: false,
                    header: () => <span className="sr-only">Actions</span>,
                    cell: ({ row }) => {
                        const subject = row.original;
                        // If the user can not make changes, return null.
                        if (!canManage) {
                            return null;
                        }
                        // If the user can make changes, show edit and delete buttons.
                        return (
                            <div className="flex items-center justify-end gap-1">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onEditSubject(subject)}
                                    disabled={isMutating}
                                    className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm lg:text-base"
                                >
                                    <Pencil className="h-3 w-3" />
                                    <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onDeleteSubject(subject)}
                                    disabled={isMutating}
                                    className="cursor-pointer border border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300 text-sm lg:text-base"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </div>
                        );
                    },
                },
            ] satisfies ColumnDef<typeof TABLE_FEATURES, singleGetSubjectPayload>[],
        [canManage, isMutating, onDeleteSubject, onEditSubject],
    );

    // Finally, render the subjects table with meaningful defaults
    return (
        <DataTable
            data={subjects}
            columns={columns}
            getRowId={(row) => row.id}
            searchColumn="name"
            searchPlaceholder="Search…"
            columnLabels={{
                name: "Subject",
                department: "Department",
            }}
            pageSize={10}
            defaultSorting={[{ id: "name", desc: false }]}
            emptyMessage="No subjects match your search."
            disabled={disabled}
            bodyRowClassName="hover:bg-muted/40"
            tableClassName="min-w-[300px]"
        />
    );
}
