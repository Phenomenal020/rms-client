"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { DataTable, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";
import type { GradingEntryPayload } from "@/types/term";

// Row wrapper — keeps the original buffer index for edit/delete handlers
export type GradingTableRow = {
    entry: GradingEntryPayload;
    sourceIndex: number;
};

// Grading system table props
type GradingSystemTableProps = {
    gradings: GradingEntryPayload[];
    canManage: boolean;
    isSaving: boolean;
    disabled?: boolean;
    onEditGrading: (sourceIndex: number) => void;
    onDeleteGrading: (sourceIndex: number) => void;
};

export function GradingSystemTable({
    gradings,
    canManage,
    isSaving,
    disabled = false,
    onEditGrading,
    onDeleteGrading,
}: GradingSystemTableProps) {
    // Display highest grade first (descending by minScore) — same as the previous manual table
    const tableRows = useMemo(
        () =>
            gradings
                .map((entry, sourceIndex) => ({ entry, sourceIndex }))
                .sort((a, b) => b.entry.minScore - a.entry.minScore),
        [gradings],
    );

    // define columns of your table
    const columns = useMemo(
        () =>
            [
                // Grade column: sortable, filterable, and searchable
                {
                    id: "grade",
                    accessorFn: (row) => row.entry.grade,
                    header: ({ column }) => (
                        <SortableHeader
                            label="Grade"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    filterFn: (row, _id, value: string) => {
                        const query = value.toLowerCase();
                        const { entry } = row.original;
                        return (
                            entry.grade.toLowerCase().includes(query) ||
                            String(entry.minScore).includes(query) ||
                            String(entry.maxScore).includes(query)
                        );
                    },
                    cell: ({ row }) => (
                        <span className="truncate font-medium">{row.original.entry.grade}</span>
                    ),
                },
                // Min score column: sortable
                {
                    id: "minScore",
                    accessorFn: (row) => row.entry.minScore,
                    header: ({ column }) => (
                        <SortableHeader
                            label="Min Score"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="truncate">{row.original.entry.minScore}</span>
                    ),
                },
                // Max score column: sortable
                {
                    id: "maxScore",
                    accessorFn: (row) => row.entry.maxScore,
                    header: ({ column }) => (
                        <SortableHeader
                            label="Max Score"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="truncate">{row.original.entry.maxScore}</span>
                    ),
                },
                // Actions column: edit and delete
                {
                    id: "actions",
                    enableSorting: false,
                    enableHiding: false,
                    header: () => <span className="sr-only">Actions</span>,
                    cell: ({ row }) => {
                        const { sourceIndex } = row.original;
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
                                    onClick={() => onEditGrading(sourceIndex)}
                                    disabled={isSaving}
                                    className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm md:text-base"
                                >
                                    <Pencil className="h-3 w-3" />
                                    <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onDeleteGrading(sourceIndex)}
                                    disabled={isSaving}
                                    className="cursor-pointer border border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300 text-sm md:text-base"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </div>
                        );
                    },
                },
            ] satisfies ColumnDef<typeof TABLE_FEATURES, GradingTableRow>[],
        [canManage, isSaving, onDeleteGrading, onEditGrading],
    );

    // Finally, render the grading system table with meaningful defaults
    return (
        <DataTable
            data={tableRows}
            columns={columns}
            getRowId={(row) =>
                row.entry.id ?? `grading-${row.sourceIndex}-${row.entry.grade}`
            }
            searchColumn="grade"
            searchPlaceholder="Search…"
            columnLabels={{
                grade: "Grade",
                minScore: "Min Score",
                maxScore: "Max Score",
            }}
            pageSize={10}
            defaultSorting={[{ id: "minScore", desc: true }]}
            emptyMessage="No grades match your search."
            disabled={disabled}
            bodyRowClassName="hover:bg-muted/40"
            tableClassName="min-w-[240px] md:text-base"
        />
    );
}
