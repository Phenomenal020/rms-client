"use client";

import { useState } from "react";
import { type ColumnDef, flexRender, SortingState, useTable } from "@tanstack/react-table";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/shadcn/ui/table";

// Table features
import {
    tableFeatures,
    rowSortingFeature,
    createSortedRowModel,
    columnFilteringFeature,
    createFilteredRowModel,
    rowPaginationFeature,
    createPaginatedRowModel,
    rowSelectionFeature,
    columnVisibilityFeature,
} from "@tanstack/react-table";

// Define row type
type TeacherMember = {
    id: string;
    name: string;
    email: string;
};

// Define basic features for now
const TABLE_FEATURES = tableFeatures({
    // State features — add sorting/filtering/selection state
    rowSortingFeature,
    columnFilteringFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    columnVisibilityFeature,

    // Row models — transform data → display rows
    sortedRowModel: createSortedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
});

// Define columns for the table (name and email only)
const columns: ColumnDef<typeof TABLE_FEATURES, TeacherMember>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => row.original.name,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email,
    },
];

// Sample teacher data
const teachers: TeacherMember[] = [
    { id: "1", name: "John Doe", email: "john.doe@example.com" },
    { id: "2", name: "Jane Smith", email: "jane.smith@example.com" },
    { id: "3", name: "Jim Beam", email: "jim.beam@example.com" },
];

export function TableTutorial() {
    // sorting state
    const [sorting, setSorting] = useState<SortingState>([]);

    // Hooks must live inside a component — not at the top level of the file
    const table = useTable({
        features: TABLE_FEATURES,
        data: teachers,
        columns,
        getRowId: (row) => row.id,
        state: { sorting },
        onSortingChange: setSorting,
    });

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                        {/* Part 1: use getAllCells(). getVisibleCells() needs columnVisibilityFeature (Part 6) */}
                        {row.getAllCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
