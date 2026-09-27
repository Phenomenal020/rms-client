"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { DataTable, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";
import type { singleTermPayload } from "@/types/term";
import { TERM_LABELS } from "./term-labels";

// Term setup table props
type TermSetupTableProps = {
    terms: singleTermPayload[];
    canManage: boolean;
    isMutating: boolean;
    disabled?: boolean;
    onEditTerm: (term: singleTermPayload) => void;
    onDeleteTerm: (term: singleTermPayload) => void;
};

export function TermSetupTable({
    terms,
    canManage,
    isMutating,
    disabled = false,
    onEditTerm,
    onDeleteTerm,
}: TermSetupTableProps) {
    // define columns of your table
    const columns = useMemo(
        () =>
            [
                // Session column: sortable, filterable, and searchable
                {
                    accessorKey: "academicYear",
                    id: "session",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Session"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    filterFn: (row, _id, value: string) => {
                        const query = value.toLowerCase();
                        const termLabel = TERM_LABELS[row.original.term].toLowerCase();
                        return (
                            row.original.academicYear.toLowerCase().includes(query) ||
                            termLabel.includes(query) ||
                            row.original.status.toLowerCase().includes(query)
                        );
                    },
                    cell: ({ row }) => {
                        const term = row.original;
                        return (
                            <span
                                className={`truncate font-medium ${term.status === "ACTIVE" ? "border-l-2 border-green-500 pl-2" : "pl-0"}`}
                            >
                                {term.academicYear}
                            </span>
                        );
                    },
                },
                // Term column: sortable
                {
                    accessorKey: "term",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Term"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => {
                        const term = row.original;
                        return (
                            <span className="truncate font-medium">
                                {TERM_LABELS[term.term]}
                                {term.status === "ACTIVE" && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                                        Active
                                    </span>
                                )}
                            </span>
                        );
                    },
                },
                // Start date column: sortable
                {
                    id: "termStart",
                    accessorFn: (row) => row.termStart ?? "",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Start Date"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="truncate text-muted-foreground">
                            {row.original.termStart
                                ? format(new Date(row.original.termStart), "MMM d, yyyy")
                                : "—"}
                        </span>
                    ),
                },
                // End date column: sortable
                {
                    id: "termEnd",
                    accessorFn: (row) => row.termEnd ?? "",
                    header: ({ column }) => (
                        <SortableHeader
                            label="End Date"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="truncate text-muted-foreground">
                            {row.original.termEnd
                                ? format(new Date(row.original.termEnd), "MMM d, yyyy")
                                : "—"}
                        </span>
                    ),
                },
                // Days column: sortable
                {
                    accessorKey: "termDays",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Days"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="truncate">{row.original.termDays ?? "—"}</span>
                    ),
                },
                // Actions column: edit and delete
                {
                    id: "actions",
                    enableSorting: false,
                    enableHiding: false,
                    header: () => <span className="sr-only">Actions</span>,
                    cell: ({ row }) => {
                        const term = row.original;
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
                                    onClick={() => onEditTerm(term)}
                                    disabled={isMutating}
                                    className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm md:text-base"
                                >
                                    <Pencil className="h-3 w-3" />
                                    <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onDeleteTerm(term)}
                                    disabled={isMutating}
                                    className="cursor-pointer border border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300 text-sm md:text-base"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </div>
                        );
                    },
                },
            ] satisfies ColumnDef<typeof TABLE_FEATURES, singleTermPayload>[],
        [canManage, isMutating, onDeleteTerm, onEditTerm],
    );

    // Finally, render the term setup table with meaningful defaults
    return (
        <DataTable
            data={terms}
            columns={columns}
            getRowId={(row) => row.id ?? ""}
            searchColumn="session"
            searchPlaceholder="Search…"
            columnLabels={{
                session: "Session",
                term: "Term",
                termStart: "Start Date",
                termEnd: "End Date",
                termDays: "Days",
            }}
            pageSize={10}
            defaultSorting={[{ id: "session", desc: true }]}
            emptyMessage="No terms match your search."
            disabled={disabled}
            bodyRowClassName="hover:bg-muted/40"
            getBodyRowClassName={(term) =>
                term.status === "ACTIVE" ? "bg-green-500/5" : undefined
            }
            tableClassName="min-w-[560px] md:text-base"
        />
    );
}
