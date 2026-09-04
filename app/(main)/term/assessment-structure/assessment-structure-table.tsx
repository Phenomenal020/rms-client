"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { DataTable, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";

// Local buffer entry shape used by the assessment structure card
export type AssessmentBufferEntry = {
    id: string | null;
    type: string;
    percentage: number;
    displayOrder: number;
};

// Row wrapper — keeps the original buffer index for edit/delete handlers
export type AssessmentTableRow = {
    entry: AssessmentBufferEntry;
    sourceIndex: number;
};

// Assessment structure table props
type AssessmentStructureTableProps = {
    entries: AssessmentBufferEntry[];
    canManage: boolean;
    isSaving: boolean;
    disabled?: boolean;
    onEditAssessment: (sourceIndex: number) => void;
    onDeleteAssessment: (sourceIndex: number) => void;
};

export function AssessmentStructureTable({
    entries,
    canManage,
    isSaving,
    disabled = false,
    onEditAssessment,
    onDeleteAssessment,
}: AssessmentStructureTableProps) {
    // Sort the assessment structures by display order — same as the previous manual table
    const tableRows = useMemo(
        () =>
            entries
                .map((entry, sourceIndex) => ({ entry, sourceIndex }))
                .sort((a, b) => a.entry.displayOrder - b.entry.displayOrder),
        [entries],
    );

    // define columns of your table
    const columns = useMemo(
        () =>
            [
                // Type column: sortable, filterable, and searchable
                {
                    id: "type",
                    accessorFn: (row) => row.entry.type,
                    header: ({ column }) => (
                        <SortableHeader
                            label="Type"
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
                            entry.type.toLowerCase().includes(query) ||
                            String(entry.percentage).includes(query) ||
                            String(entry.displayOrder).includes(query)
                        );
                    },
                    cell: ({ row }) => (
                        <span className="truncate font-medium">{row.original.entry.type}</span>
                    ),
                },
                // Percentage column: sortable
                {
                    id: "percentage",
                    accessorFn: (row) => row.entry.percentage,
                    header: ({ column }) => (
                        <SortableHeader
                            label="Percentage"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="truncate">{row.original.entry.percentage}%</span>
                    ),
                },
                // Order column: sortable
                {
                    id: "displayOrder",
                    accessorFn: (row) => row.entry.displayOrder,
                    header: ({ column }) => (
                        <SortableHeader
                            label="Order"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="truncate">#{row.original.entry.displayOrder}</span>
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
                                    onClick={() => onEditAssessment(sourceIndex)}
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
                                    onClick={() => onDeleteAssessment(sourceIndex)}
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
            ] satisfies ColumnDef<typeof TABLE_FEATURES, AssessmentTableRow>[],
        [canManage, isSaving, onDeleteAssessment, onEditAssessment],
    );

    // Finally, render the assessment structure table with meaningful defaults
    return (
        <DataTable
            data={tableRows}
            columns={columns}
            getRowId={(row) =>
                row.entry.id ?? `assessment-${row.sourceIndex}-${row.entry.type}`
            }
            searchColumn="type"
            searchPlaceholder="Search…"
            columnLabels={{
                type: "Type",
                percentage: "Percentage",
                displayOrder: "Order",
            }}
            pageSize={10}
            defaultSorting={[{ id: "displayOrder", desc: false }]}
            emptyMessage="No assessments match your search."
            disabled={disabled}
            bodyRowClassName="hover:bg-muted/40"
            tableClassName="min-w-[320px] md:text-base"
        />
    );
}
