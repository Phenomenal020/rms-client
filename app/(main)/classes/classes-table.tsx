"use client";

import { useMemo } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { DataTable, getPaginatedSerialNumber, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";
import type { getClassPayload } from "@/types/classes";

// Classes table props
type ClassesTableProps = {
    classes: getClassPayload[];
    canManage: boolean;
    isMutating: boolean;
    disabled?: boolean;
    onDeleteClass: (cls: getClassPayload) => void;
};

export function ClassesTable({
    classes,
    canManage,
    isMutating,
    disabled = false,
    onDeleteClass,
}: ClassesTableProps) {
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
                // Class column: sortable, filterable, and searchable
                {
                    accessorKey: "name",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Class"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    filterFn: (row, _id, value: string) => {
                        const query = value.toLowerCase();
                        const teacherName = (row.original.formTeacher?.name ?? "Not Assigned").toLowerCase();
                        return (
                            row.original.name.toLowerCase().includes(query) ||
                            teacherName.includes(query)
                        );
                    },
                    cell: ({ row }) => (
                        <span className="block truncate font-medium text-foreground" title={row.original.name}>
                            {row.original.name}
                        </span>
                    ),
                },
                // Class teacher column: sortable
                {
                    id: "formTeacher",
                    accessorFn: (row) => row.formTeacher?.name ?? "Not Assigned",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Class Teacher"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => {
                        const teacherName = row.original.formTeacher?.name ?? null;
                        return (
                            <span
                                className="block truncate text-muted-foreground"
                                title={teacherName ?? undefined}
                            >
                                {teacherName ?? <span className="italic">Not assigned</span>}
                            </span>
                        );
                    },
                },
                // Subjects column: sortable by count
                {
                    id: "subjects",
                    accessorFn: (row) => row.subjectClassAssignments?.length,
                    enableSorting: true,
                    header: ({ column }) => (
                        <SortableHeader
                            label="Subjects"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => {
                        const cls = row.original;
                        if (cls.subjectClassAssignments?.length === 0) {
                            return (
                                <Link
                                    href={`/classes/${cls.id}`}
                                    className="text-xs italic text-muted-foreground hover:text-foreground hover:underline"
                                >
                                    None assigned
                                </Link>
                            );
                        }

                        return (
                            <Link
                                href={`/classes/${cls.id}`}
                                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
                            >
                                <BookOpen className="h-3 w-3" />
                                {cls.subjectClassAssignments?.length ?? 0} subject
                                {cls.subjectClassAssignments?.length !== 1 ? "s" : ""}
                            </Link>
                        );
                    },
                },
                // Actions column: edit and delete
                {
                    id: "actions",
                    enableSorting: false,
                    enableHiding: false,
                    header: () => <span className="sr-only">Actions</span>,
                    cell: ({ row }) => {
                        const cls = row.original;
                        // If the user can not make changes, return null.
                        if (!canManage) {
                            return null;
                        }
                        // If the user can make changes, show edit and delete buttons.
                        return (
                            <div className="flex items-center justify-end gap-1">
                                {/* Edit button */}
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    disabled={isMutating}
                                    className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm lg:text-base"
                                >
                                    <Link href={`/classes/${cls.id}`} aria-label="Edit class">
                                        <Pencil className="h-3 w-3" />
                                        <span className="hidden sm:inline">Edit</span>
                                    </Link>
                                </Button>
                                {/* Delete button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDeleteClass(cls)}
                                    disabled={isMutating}
                                    className="cursor-pointer border border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300 text-sm lg:text-base"
                                    aria-label="Delete class"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </div>
                        );
                    },
                },
            ] satisfies ColumnDef<typeof TABLE_FEATURES, getClassPayload>[],
        [canManage, isMutating, onDeleteClass],
    );

    // Finally, render the classes table with meaningful defaults
    return (
        <DataTable
            data={classes}
            columns={columns}
            getRowId={(row) => row.id}
            searchColumn="name"
            searchPlaceholder="Search…"
            columnLabels={{
                name: "Class",
                formTeacher: "Class Teacher",
                subjects: "Subjects",
            }}
            pageSize={10}
            defaultSorting={[{ id: "name", desc: false }]}
            emptyMessage="No classes match your search."
            disabled={disabled}
            bodyRowClassName="hover:bg-muted/40"
            tableClassName="min-w-[500px] lg:text-base"
        />
    );
}
