"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { DataTable, getPaginatedSerialNumber, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";
import type { getSingleStudent } from "@/types/students";
import type { ClassOption } from "./students-form";
import { getDisplayName, toTitleCase } from "./students-form";

// Students table props
type StudentsTableProps = {
    students: getSingleStudent[];
    classOptions: ClassOption[];
    canManage: boolean;
    isMutating: boolean;
    disabled?: boolean;
    onEditStudent: (student: getSingleStudent) => void;
    onDeleteStudent: (student: getSingleStudent) => void;
};

export function StudentsTable({
    students,
    classOptions,
    canManage,
    isMutating,
    disabled = false,
    onEditStudent,
    onDeleteStudent,
}: StudentsTableProps) {
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
                // Student column: sortable, filterable, and searchable
                {
                    id: "student",
                    accessorFn: (row) =>
                        getDisplayName({
                            firstName: row.firstName,
                            middleName: row.middleName ?? "",
                            lastName: row.lastName,
                        }),
                    header: ({ column }) => (
                        <SortableHeader
                            label="Student"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    filterFn: (row, _id, value: string) => {
                        const query = value.toLowerCase();
                        const fullName = getDisplayName({
                            firstName: row.original.firstName,
                            middleName: row.original.middleName ?? "",
                            lastName: row.original.lastName,
                        }).toLowerCase();
                        const className =
                            classOptions.find((c) => c.id === row.original.classId)?.name ?? "";
                        return (
                            fullName.includes(query) ||
                            row.original.gender.toLowerCase().includes(query) ||
                            className.toLowerCase().includes(query)
                        );
                    },
                    cell: ({ row }) => (
                        <span className="block truncate font-medium text-foreground">
                            {getDisplayName({
                                firstName: row.original.firstName,
                                middleName: row.original.middleName ?? "",
                                lastName: row.original.lastName,
                            })}
                        </span>
                    ),
                },
                // Class column: sortable
                {
                    id: "class",
                    accessorFn: (row) =>
                        classOptions.find((c) => c.id === row.classId)?.name ?? "Not Assigned",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Class"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="text-foreground">
                            {classOptions.find((c) => c.id === row.original.classId)?.name ??
                                "Not Assigned"}
                        </span>
                    ),
                },
                // Gender column: sortable
                {
                    accessorKey: "gender",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Gender"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="block truncate font-medium text-foreground">
                            {toTitleCase(row.original.gender)}
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
                        const student = row.original;
                        // If the user can not make changes, return null.
                        if (!canManage) {
                            return null;
                        }
                        // If the user can make changes, show edit and delete buttons.
                        return (
                            <div className="flex items-center justify-end gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditStudent(student)}
                                    disabled={isMutating}
                                    className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm lg:text-base"
                                    aria-label="Edit student"
                                >
                                    <Pencil className="h-3 w-3" />
                                    <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDeleteStudent(student)}
                                    disabled={isMutating}
                                    className="cursor-pointer border border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300 text-sm lg:text-base"
                                    aria-label="Delete student"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </div>
                        );
                    },
                },
            ] satisfies ColumnDef<typeof TABLE_FEATURES, getSingleStudent>[],
        [canManage, classOptions, isMutating, onDeleteStudent, onEditStudent],
    );

    // Finally, render the students table with meaningful defaults
    return (
        <DataTable
            data={students}
            columns={columns}
            getRowId={(row) => row.id}
            searchColumn="student"
            searchPlaceholder="Search by name, gender, or class…"
            columnLabels={{
                student: "Student",
                class: "Class",
                gender: "Gender",
            }}
            pageSize={10}
            defaultSorting={[{ id: "student", desc: false }]}
            emptyMessage="No students match your search."
            disabled={disabled}
            bodyRowClassName="hover:bg-muted/40"
            tableClassName="min-w-[480px] lg:text-base"
        />
    );
}