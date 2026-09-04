"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import {
    DataTable,
    SortableHeader,
    TABLE_FEATURES,
} from "@/shared-components/data-table";
import { LoadingButton } from "@/shared-components/loading-button";
import { StatusBadge } from "../helpers/dashboard-badge";
import type { PendingRecordRequestRow } from "@/fetcher/queries";

// Map api statuses to badge statuses
function statusForBadge(status: string) {
    if (status === "ACCEPTED" || status === "APPROVED") return "Accepted";
    if (status === "REJECTED") return "Declined";
    if (status === "PENDING") return "Pending";
    return status;
}

// Record requests table props
type RecordRequestsTableProps = {
    requests: PendingRecordRequestRow[];
    canManage: boolean;
    busy: boolean;
    actionId: string | null;
    isAccepting: boolean;
    isRejecting: boolean;
    disabled?: boolean;
    onAccept: (row: PendingRecordRequestRow) => void;
    onDecline: (row: PendingRecordRequestRow) => void;
};

export function RecordRequestsTable({
    requests,
    canManage,
    busy,
    actionId,
    isAccepting,
    isRejecting,
    disabled = false,
    onAccept,
    onDecline,
}: RecordRequestsTableProps) {
    // Define columns of the table
    const columns = useMemo(
        () =>
            [
                // Teacher column: sortable, filterable, and searchable
                {
                    accessorKey: "formTeacherName",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Teacher"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    filterFn: (row, _id, value: string) => {
                        const query = value.toLowerCase();
                        const request = row.original;
                        return (
                            request.formTeacherName.toLowerCase().includes(query) ||
                            request.className.toLowerCase().includes(query)
                        );
                    },
                    cell: ({ row }) => (
                        <span
                            className="block truncate font-medium text-foreground"
                            title={row.original.formTeacherName.trim() || undefined}
                        >
                            {row.original.formTeacherName.trim() || "—"}
                        </span>
                    ),
                },
                // Class column: sortable
                {
                    accessorKey: "className",
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
                        <span
                            className="block truncate text-muted-foreground"
                            title={row.original.className || undefined}
                        >
                            {row.original.className || "—"}
                        </span>
                    ),
                },
                // Status column: sortable
                {
                    accessorKey: "status",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Status"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <StatusBadge status={statusForBadge(row.original.status)} />
                    ),
                    meta: { cellClassName: "p-1" },
                },
                // Submitted column: sortable by createdAt
                {
                    accessorKey: "createdAt",
                    header: ({ column }) => (
                        <SortableHeader
                            label="Submitted"
                            sorted={column.getIsSorted()}
                            onToggle={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        />
                    ),
                    cell: ({ row }) => (
                        <span className="tabular-nums text-muted-foreground">
                            {new Date(row.original.createdAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </span>
                    ),
                },
                // Actions column: accept or decline a record request
                {
                    id: "actions",
                    enableSorting: false,
                    enableHiding: false,
                    header: () => <span className="sr-only">Actions</span>,
                    cell: ({ row }) => {
                        const request = row.original;
                        const isRowBusy = busy && actionId === request.id;  // true iff this row is being modified (to display the spinner on the correct row)

                        return (
                            <div className="flex items-center justify-end gap-1">
                                {/* Accept button */}
                                <LoadingButton
                                    type="button"
                                    size="sm"
                                    loading={isRowBusy && isAccepting}
                                    disabled={!canManage || busy || disabled}
                                    onClick={() => onAccept(request)}
                                    className="cursor-pointer border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
                                >
                                    <Check className="h-3 w-3" />
                                    <span className="hidden sm:inline">Accept</span>
                                </LoadingButton>
                                {/* Decline button */}
                                <LoadingButton
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    loading={isRowBusy && isRejecting}
                                    disabled={!canManage || busy || disabled}
                                    onClick={() => onDecline(request)}
                                    className="cursor-pointer border border-rose-500/25 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-300"
                                >
                                    <X className="h-3 w-3" />
                                    <span className="hidden sm:inline">Decline</span>
                                </LoadingButton>
                            </div>
                        );
                    },
                    meta: { cellClassName: "py-2 px-0" },
                },
            ] satisfies ColumnDef<typeof TABLE_FEATURES, PendingRecordRequestRow>[],
        [actionId, busy, canManage, disabled, isAccepting, isRejecting, onAccept, onDecline],
    );

    // Finally, render the record requests table with meaningful defaults
    return (
        <DataTable
            data={requests}
            columns={columns}
            getRowId={(row) => row.id}
            searchColumn="formTeacherName"
            searchPlaceholder="Search requests…"
            columnLabels={{
                formTeacherName: "Teacher",
                className: "Class",
                status: "Status",
                createdAt: "Submitted",
            }}
            pageSize={10}
            defaultSorting={[{ id: "createdAt", desc: true }]}
            emptyMessage="No requests match your search."
            disabled={disabled || busy}
            tableClassName="min-w-[640px] text-sm"
        />
    );
}
