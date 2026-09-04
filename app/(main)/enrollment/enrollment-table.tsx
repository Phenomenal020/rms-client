"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { BookOpen, Pencil } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import {
    DataTable,
    getPaginatedSerialNumber,
    SortableHeader,
    TABLE_FEATURES,
} from "@/shared-components/data-table";
import type { EnrollmentStudent } from "./enrollment-form";

// Enrollment table props
type EnrollmentTableProps = {
    students: EnrollmentStudent[];
    canManage: boolean;
    isSaving: boolean;
    disabled?: boolean;
    onEditEnrollment: (student: EnrollmentStudent) => void;
};

export function EnrollmentTable({
    students,
    canManage,
    isSaving,
    disabled = false,
    onEditEnrollment,
}: EnrollmentTableProps) {
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
                    accessorKey: "name",
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
                        return row.original.name.toLowerCase().includes(query);
                    },
                    cell: ({ row }) => (
                        <span className="block truncate font-medium text-foreground" title={row.original.name}>
                            {row.original.name}
                        </span>
                    ),
                },
                // Enrolled subjects column: sortable by count
                {
                    id: "enrolledSubjects",
                    accessorFn: (row) => row.enrolledSubjectIds.length,
                    header: ({ column }) => (
                        <SortableHeader
                            label="Enrolled Subjects"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) =>
                        row.original.enrolledSubjectIds.length === 0 ? (
                            <span className="text-xs italic text-muted-foreground">None enrolled</span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                <BookOpen className="h-3 w-3" />
                                {row.original.enrolledSubjectIds.length} subject
                                {row.original.enrolledSubjectIds.length !== 1 ? "s" : ""}
                            </span>
                        ),
                },
                // Actions column: edit enrollment
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
                        // If the user can make changes, show the edit button.
                        return (
                            <div className="flex items-center justify-end gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditEnrollment(student)}
                                    disabled={isSaving}
                                    className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm lg:text-base"
                                    aria-label="Edit enrollment"
                                >
                                    <Pencil className="h-3 w-3" />
                                    <span className="hidden sm:inline">Edit</span>
                                </Button>
                            </div>
                        );
                    },
                },
            ] satisfies ColumnDef<typeof TABLE_FEATURES, EnrollmentStudent>[],
        [canManage, isSaving, onEditEnrollment],
    );

    // Finally, render the enrollment table with meaningful defaults
    return (
        <DataTable
            data={students}
            columns={columns}
            getRowId={(row) => row.studentId}
            searchColumn="name"
            searchPlaceholder="Search students…"
            columnLabels={{
                name: "Student",
                enrolledSubjects: "Enrolled Subjects",
            }}
            pageSize={10}
            defaultSorting={[{ id: "name", desc: false }]}
            emptyMessage="No students match your search."
            disabled={disabled}
            bodyRowClassName="hover:bg-muted/40"
            tableClassName="min-w-[360px] lg:text-base"
        />
    );
}
