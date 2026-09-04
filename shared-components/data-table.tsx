"use client";

import * as React from "react";
import {
    type ColumnDef, type ColumnFiltersState, type ColumnVisibilityState, type RowData, type SortingState, columnFilteringFeature, columnVisibilityFeature,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    flexRender,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    tableFeatures,
    useTable,
} from "@tanstack/react-table";
import {
    ArrowDown, ArrowUp,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Columns3,
    Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { Input } from "@/shadcn/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shadcn/ui/table";

type ColumnClassMeta = {
    headClassName?: string;
    cellClassName?: string;
};

// Register all the features we want to use for the table
export const TABLE_FEATURES = tableFeatures({
    rowSortingFeature,
    columnFilteringFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    columnVisibilityFeature,
    sortedRowModel: createSortedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
});

// v9: cell context uses core `table` — read pagination via atoms, not getState()
export function getPaginatedSerialNumber(
    row: { index: number },
    table: { atoms: { pagination: { get: () => { pageIndex: number; pageSize: number } } } },
) {
    const { pageIndex, pageSize } = table.atoms.pagination.get();
    return pageIndex * pageSize + row.index + 1;
}

export function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
    if (sorted === "asc") {
        return <ArrowUp className="size-3.5" aria-hidden="true" />;
    }
    if (sorted === "desc") {
        return <ArrowDown className="size-3.5" aria-hidden="true" />;
    }
    return (
        <ChevronsUpDown
            className="size-3.5 text-muted-foreground/60"
            aria-hidden="true"
        />
    );
}

export function SortableHeader({
    label,
    sorted,
    onToggle,
    align = "left",
}: {
    label: string;
    sorted: false | "asc" | "desc";
    onToggle: () => void;
    align?: "left" | "right";
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "inline-flex items-center gap-1 rounded-md px-1 font-semibold text-muted-foreground transition-colors hover:text-foreground",
                align === "right" && "ml-auto",
            )}
        >
            {label}
            <SortIcon sorted={sorted} />
        </button>
    );
}

type DataTableProps<TData extends RowData> = {
    data: TData[];
    columns: ColumnDef<typeof TABLE_FEATURES, TData>[];
    getRowId: (row: TData) => string;
    searchColumn?: string;
    searchPlaceholder?: string;
    columnLabels?: Record<string, string>;
    pageSize?: number;
    defaultSorting?: SortingState;
    enableRowSelection?: boolean;
    enableColumnVisibility?: boolean;
    showSearch?: boolean;
    showPagination?: boolean;
    emptyMessage?: string;
    disabled?: boolean;
    toolbarExtra?: React.ReactNode;
    bulkActions?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    tableClassName?: string;
    headerRowClassName?: string;
    bodyRowClassName?: string;
    getBodyRowClassName?: (row: TData) => string | undefined;
};

// The function that creates the data table
export function DataTable<TData extends RowData>({
    data,
    columns,
    getRowId,
    searchColumn = "name",
    searchPlaceholder = "Search…",
    columnLabels = {},
    pageSize = 10,
    defaultSorting = [],
    enableRowSelection = false,
    enableColumnVisibility = true,
    showSearch = true,
    showPagination = true,
    emptyMessage = "No results match your search.",
    disabled = false,
    toolbarExtra,
    bulkActions,
    className,
    containerClassName,
    tableClassName,
    headerRowClassName,
    bodyRowClassName,
    getBodyRowClassName,
}: DataTableProps<TData>) {
    // Sorting state (controlled)
    const [sorting, setSorting] = React.useState<SortingState>(defaultSorting);
    // Column filtering state (controlled)
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    // Column visibility state (controlled)
    const [columnVisibility, setColumnVisibility] =
        React.useState<ColumnVisibilityState>({});
    // Row selection state (controlled)
    const [rowSelection, setRowSelection] = React.useState({});

    // Create the table
    const table = useTable({
        features: TABLE_FEATURES,
        data,
        columns,
        getRowId,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        initialState: { pagination: { pageIndex: 0, pageSize } },
    });

    // Get the filter column, value, selected count, total count, and page count for useful data to display in the toolbar
    const filterColumn = table.getColumn(searchColumn);
    const filterValue = (filterColumn?.getFilterValue() as string) ?? "";
    const selectedCount = table.getFilteredSelectedRowModel().rows.length;
    const totalCount = table.getFilteredRowModel().rows.length;
    const pageCount = table.getPageCount();


    return (
        <div className={cn("space-y-3", className)}>
            {/* Search and filter section */}
            {(showSearch || toolbarExtra || enableColumnVisibility) && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {/* Search input and icon*/}
                {showSearch ? (
                <div className="relative w-full sm:max-w-xs">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        value={filterValue}
                        onChange={(event) =>
                            filterColumn?.setFilterValue(event.target.value)
                        }
                        placeholder={searchPlaceholder}
                        className="h-10 pl-8 text-sm md:h-12"
                        aria-label={searchPlaceholder}
                        disabled={disabled}
                    />
                </div>
                ) : (
                    <div />
                )}
                {/* Column visibility dropdown (view button) */}
                <div className="flex items-center gap-2">
                    {enableColumnVisibility && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                {/* View Button (triggers the dropdown menu) */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-10 md:h-12 cursor-pointer"
                                    disabled={disabled}
                                    aria-label="Toggle columns"
                                >
                                    <Columns3 className="size-3.5" aria-hidden="true" />
                                    View
                                </Button>
                            </DropdownMenuTrigger>
                            {/* Dropdown menu content: Onclick toggles the column visibility */}
                            <DropdownMenuContent align="end" className="w-40">
                                {/* Dropdown menu group */}
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(checked) =>
                                                    column.toggleVisibility(checked === true)
                                                }
                                                onSelect={(event) => event.preventDefault()}
                                            >
                                                {columnLabels[column.id] ?? column.id}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {toolbarExtra}
                </div>
            </div>
            )}

            {/* If row selection is enabled and there are selected rows, show the bulk actions */}
            {enableRowSelection && selectedCount > 0 && bulkActions && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground tabular-nums">
                            {selectedCount} selected
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => table.resetRowSelection()}
                        >
                            Clear
                        </Button>
                    </div>
                    {bulkActions}
                </div>
            )}

            {/* Finally, render the table */}
            <div
                className={cn(
                    "overflow-hidden rounded-sm border border-border bg-card",
                    containerClassName,
                )}
            >
                {/* Table container */}
                <Table className={tableClassName}>
                    {/* Table header */}
                    <TableHeader>
                        {/* Table header groups */}
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className={cn(
                                    "border-b border-border bg-muted/50 hover:bg-muted/50",
                                    headerRowClassName,
                                )}
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            "h-auto p-2",
                                            header.column.id === "select" && "w-10 pl-4",
                                            header.column.id === "actions" && "w-[12%] text-right",
                                            (header.column.columnDef.meta as ColumnClassMeta | undefined)
                                                ?.headClassName,
                                        )}
                                    >
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
                    {/* Table body */}
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() ? "selected" : undefined}
                                    className={cn(
                                        "border-b border-border transition-colors last:border-b-0 hover:bg-primary/5",
                                        bodyRowClassName,
                                        getBodyRowClassName?.(row.original),
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                "p-2",
                                                cell.column.id === "select" && "pl-4",
                                                cell.column.id === "actions" && "text-right",
                                                (cell.column.columnDef.meta as ColumnClassMeta | undefined)
                                                    ?.cellClassName,
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="hover:bg-transparent">
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-sm text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination section */}
                {showPagination && (
                <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-2.5">
                    {/* Total count and results text */}
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{totalCount}</span>{" "}
                        {totalCount === 1 ? "result" : "results"}
                    </p>
                    {/* Previous and next page buttons */}
                    <div className="flex items-center gap-1.5">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="size-3.5" aria-hidden="true" />
                        </Button>
                        <span className="px-1 text-xs text-muted-foreground tabular-nums">
                            Page {table.state.pagination.pageIndex + 1} of{" "}
                            {Math.max(pageCount, 1)}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            aria-label="Next page"
                        >
                            <ChevronRight className="size-3.5" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}

// Create the select column
export function createSelectColumn<TData extends RowData>(): ColumnDef<typeof TABLE_FEATURES, TData> {
    return {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected()
                        ? true
                        : table.getIsSomePageRowsSelected()
                            ? "indeterminate"
                            : false
                }
                onCheckedChange={(checked) =>
                    table.toggleAllPageRowsSelected(checked === true)
                }
                aria-label="Select all rows on this page"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(checked) => row.toggleSelected(checked === true)}
                aria-label="Select row"
            />
        ),
    };
}
