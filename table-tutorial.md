# Building Data Tables with TanStack Table v9

A step-by-step tutorial for the RMS client. This guide walks you from a plain HTML `<table>` to a reusable, feature-rich data table — the same journey we took for the Teachers page.

**What you'll build**

1. A minimal TanStack table (understand the core idea)
2. Sorting, filtering, and pagination (one feature at a time)
3. A generic `DataTable` component (reuse across pages)
4. A page-specific table (`TeachersTable`) wired into your existing form

**Prerequisites**

- `@tanstack/react-table` v9+ installed
- Shadcn `Table`, `Input`, `Button`, `Checkbox`, `DropdownMenu` in your project
- A client component (`"use client"`) — TanStack hooks only work on the client

---

## Part 0: The mental model

### Why TanStack Table?

Before TanStack, your Teachers page looked like this:

```tsx
// Manual approach (what you had)
const filteredTeachers = useMemo(() => {
  const query = searchQuery.trim().toLowerCase();
  return teacherList.filter((t) =>
    t.name.toLowerCase().includes(query) ||
    t.email.toLowerCase().includes(query)
  );
}, [teacherList, searchQuery]);

// Then: filteredTeachers.map(...) inside a <table>
```

You owned **everything**: filter logic, sort logic, pagination math, column visibility, selection state. Each new table duplicated that work.

**TanStack Table is headless.** It does not render UI. It gives you:


| TanStack provides                        | You provide                    |
| ---------------------------------------- | ------------------------------ |
| Row models (sorted, filtered, paginated) | HTML / Shadcn markup           |
| Column definitions                       | Cell styling                   |
| State (sort, filter, page, selection)    | Toolbar buttons, inputs        |
| API (`table.getRowModel()`, etc.)        | Your app's data fetching (SWR) |


Think of it as a **state engine for tabular data**, not a `<Table>` component.

### Why v9 is different from v8

If you read older tutorials, you'll see `useReactTable`. In v9:


| v8                           | v9                                      |
| ---------------------------- | --------------------------------------- |
| `useReactTable()`            | `useTable()`                            |
| Features bundled by default  | You opt in via `tableFeatures({ ... })` |
| Less React Compiler friendly | Built on TanStack Store                 |


**Why opt-in features?** Smaller bundles. If you don't need row selection, don't import `rowSelectionFeature`. You only pay for what you use.

### Architecture in this project

```
teachers-form.tsx          ← fetches data (SWR), handles modals, loading/error states
    └── teachers-table.tsx ← defines columns for teachers (Name, Email, Actions)
            └── data-table.tsx ← generic shell (toolbar, pagination, rendering loop)
```

**Rule of thumb:** keep data fetching in the page/form; keep column definitions in a `*-table.tsx` file; keep shared UI in `shared-components/data-table.tsx`.

---

## Part 1: Your first table (10 lines of logic)

Create a scratch file (or follow along mentally). Goal: render rows from an array.

### Step 1.1 — Define your row type

Types tell TanStack what each row looks like. Match your API shape.

```tsx
type TeacherMember = {
  id: string;
  name: string;
  email: string;
};
```

**Why `id`?** React needs stable keys. **TanStack needs stable row identity for selection and updates. Always provide** `getRowId`**.**

### Step 1.2 — Define columns

A **column definition** answers three questions:

1. **Which field?** (`accessorKey`)
2. **What goes in the header?** (`header`)
3. **How do we render each cell?** (`cell`)

```tsx
import { type ColumnDef, flexRender, useTable, tableFeatures } from "@tanstack/react-table";

// v9: even a bare table needs a features object (can be empty-ish)
const BASIC_FEATURES = tableFeatures({});

const columns: ColumnDef<typeof BASIC_FEATURES, TeacherMember>[] = [
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
```

**Why `row.original`?** TanStack wraps each data item in a `row` object with helpers (`getIsSelected()`, etc.). `row.original` is your raw `TeacherMember`.

**Why `flexRender`?** Headers and cells can be strings *or* React components. `flexRender` handles both:

```tsx
flexRender(header.column.columnDef.header, header.getContext())
```

### Step 1.3 — Create the table instance

```tsx
"use client";

const teachers: TeacherMember[] = [/* from SWR */];

const table = useTable({
  features: BASIC_FEATURES,
  data: teachers,
  columns,
  getRowId: (row) => row.id,
});
```

**Why `getRowId`?** Without it, TanStack uses array index. Index breaks when you sort, filter, or delete rows — selection and animations go wrong.

### Step 1.4 — Render with Shadcn

This loop is the same in every TanStack + Shadcn project:

```tsx
<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
  <TableBody>
    {table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Read this carefully — it's the pattern everything else builds on:**

```
getHeaderGroups() → headers → flexRender(header)
getRowModel()     → rows    → getVisibleCells() → flexRender(cell)
```

You never loop over `data` directly once TanStack is wired up. You loop over **models** (`getRowModel()`), which respect sort/filter/page state.

---

## Part 2: Registering features (the v9 way)

Each capability is a **feature** plus, usually, a **row model**.

### Step 2.1 — What is `tableFeatures`?

```tsx
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

export const TABLE_FEATURES = tableFeatures({
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
```


| Piece                       | Role                                              |
| --------------------------- | ------------------------------------------------- |
| `rowSortingFeature`         | Adds `sorting` state and `column.toggleSorting()` |
| `createSortedRowModel()`    | Produces sorted rows from raw data                |
| `columnFilteringFeature`    | Adds `columnFilters` state                        |
| `createFilteredRowModel()`  | Produces filtered rows                            |
| `rowPaginationFeature`      | Adds `pagination` state (`pageIndex`, `pageSize`) |
| `createPaginatedRowModel()` | Slices rows for the current page                  |


**Why both feature + row model?** The feature owns **state** ("sort by name ascending"). The row model owns **computation** (reorder rows). Separation keeps the library modular.

**Order matters conceptually:** data → filtered → sorted → paginated. TanStack chains these internally when you register all models.

---

## Part 3: Sorting

### Step 3.1 — Controlled sorting state

TanStack can manage state internally, but we use **controlled state** so React re-renders predictably:

```tsx
const [sorting, setSorting] = useState<SortingState>([]);

const table = useTable({
  features: TABLE_FEATURES,
  data,
  columns,
  getRowId: (row) => row.id,
  state: { sorting },
  onSortingChange: setSorting,
});
```

**Why controlled?** You can persist sort to URL, reset it, or sync across tabs. Controlled state is the React way.

### Step 3.2 — Clickable column headers

Replace a plain string header with a button:

```tsx
{
  accessorKey: "name",
  header: ({ column }) => (
    <button
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Name
      {/* show arrow based on column.getIsSorted() → false | "asc" | "desc" */}
    </button>
  ),
  cell: ({ row }) => row.original.name,
}
```

**How `toggleSorting` works:** First click → ascending. Second → descending. Third → clear (if configured). Passing `column.getIsSorted() === "asc"` flips between asc and desc on each click.

We extracted this into `SortableHeader` in `shared-components/data-table.tsx` so every table gets consistent header UI.

### Step 3.3 — Default sort

```tsx
const [sorting, setSorting] = useState<SortingState>([
  { id: "name", desc: false },
]);
```

Or pass `defaultSorting` as a prop to `DataTable` — the Teachers table defaults to name A→Z.

---

## Part 4: Filtering / search

### Step 4.1 — The old way vs TanStack way

**Before (manual):**

```tsx
const [searchQuery, setSearchQuery] = useState("");
// useMemo filter over entire array
```

**After (TanStack):**

```tsx
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

// In useTable:
state: { columnFilters },
onColumnFiltersChange: setColumnFilters,

// In JSX:
const filterColumn = table.getColumn("name");
<Input
  value={(filterColumn?.getFilterValue() as string) ?? ""}
  onChange={(e) => filterColumn?.setFilterValue(e.target.value)}
/>
```

**Why attach filter to a column?** TanStack filters per-column by default. The search box sets the filter value on the `"name"` column.

### Step 4.2 — Custom filter: search name *and* email

By default, filtering only checks the column's `accessorKey` (`name`). Your Teachers search also matched email. Fix with `filterFn`:

```tsx
{
  accessorKey: "name",
  filterFn: (row, _columnId, filterValue: string) => {
    const query = filterValue.toLowerCase();
    return (
      row.original.name.toLowerCase().includes(query) ||
      row.original.email.toLowerCase().includes(query)
    );
  },
  // ...
}
```

**Why on the `name` column?** Because `searchColumn="name"` in `DataTable` calls `table.getColumn("name")?.setFilterValue(...)`. The filter value lives on that column; `filterFn` decides how to apply it.

### Step 4.3 — Empty search results

When filter matches nothing, `table.getRowModel().rows` is empty. Render a fallback row:

```tsx
{table.getRowModel().rows.length ? (
  table.getRowModel().rows.map(/* ... */)
) : (
  <TableRow>
    <TableCell colSpan={columns.length}>
      No teachers match your search.
    </TableCell>
  </TableRow>
)}
```

**Why not a separate `<EmptySearch />` component?** You can still use one, but then the parent needs the filter value. Keeping empty state inside `DataTable` is simpler when search lives in the toolbar.

---

## Part 5: Pagination

### Step 5.1 — Initial page size

```tsx
const table = useTable({
  // ...
  initialState: {
    pagination: { pageIndex: 0, pageSize: 10 },
  },
});
```

**Why `initialState` not `state`?** Pagination can be uncontrolled until the user clicks next/prev. We don't need `useState` for page index unless you want full control (e.g. sync page to URL).

### Step 5.2 — Footer controls

```tsx
const totalCount = table.getFilteredRowModel().rows.length; // all matching rows
const pageCount = table.getPageCount();

<Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
<span>Page {table.state.pagination.pageIndex + 1} of {Math.max(pageCount, 1)}</span>
<Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
```

**Important distinction:**


| Method                       | Returns                                                |
| ---------------------------- | ------------------------------------------------------ |
| `getRowModel()`              | Current **page** rows (after filter + sort + paginate) |
| `getFilteredRowModel()`      | All filtered rows (all pages)                          |
| `getPrePaginationRowModel()` | Filtered + sorted, before slice                        |


Use `getFilteredRowModel().rows.length` for "42 results". Use `getRowModel()` to render the table body.

---

## Part 6: Column visibility

### Step 6.1 — Enable hiding

Register `columnVisibilityFeature` in `TABLE_FEATURES`, then:

```tsx
const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});

// useTable state:
state: { columnVisibility },
onColumnVisibilityChange: setColumnVisibility,
```

### Step 6.2 — "View" dropdown

```tsx
table.getAllColumns()
  .filter((column) => column.getCanHide())
  .map((column) => (
    <DropdownMenuCheckboxItem
      key={column.id}
      checked={column.getIsVisible()}
      onCheckedChange={(checked) => column.toggleVisibility(checked === true)}
    >
      {columnLabels[column.id] ?? column.id}
    </DropdownMenuCheckboxItem>
  ))
```

**Why `enableHiding: false` on actions column?**

```tsx
{
  id: "actions",
  enableHiding: false,  // never hide the Actions column
  // ...
}
```

Without this, users could hide all columns including actions — bad UX.

---

## Part 7: Action columns (no accessor)

Not every column maps to a data field. Actions is a **display column**:

```tsx
{
  id: "actions",           // required when there's no accessorKey
  enableSorting: false,
  enableHiding: false,
  header: () => <span className="sr-only">Actions</span>,
  cell: ({ row }) => {
    const teacher = row.original;
    return (
      <Button onClick={() => onViewTeacher(teacher)}>View</Button>
    );
  },
}
```

**Why `useMemo` for columns?**

```tsx
const columns = useMemo(
  () => [ /* column defs using canManage, onViewTeacher, etc. */ ],
  [canManage, currentUserId, addLoading, onViewTeacher],
);
```

Column defs are objects recreated each render. `useTable` compares columns by reference. Without `useMemo`, you risk unnecessary re-renders or subtle bugs. Any prop used inside `cell` must be in the dependency array.

---

## Part 8: Extracting the generic `DataTable`

Now you understand each piece. The generic component in `shared-components/data-table.tsx` is just Parts 1–7 composed together with props:

```tsx
type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<typeof TABLE_FEATURES, TData>[];
  getRowId: (row: TData) => string;
  searchColumn?: string;      // which column receives the search filter
  pageSize?: number;
  defaultSorting?: SortingState;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  emptyMessage?: string;
  // ...
};
```

**Design decisions:**


| Prop               | Why it exists                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `searchColumn`     | Different tables filter on different columns (teachers → `name`, maybe students → `fullName`) |
| `columnLabels`     | Human-readable names in the View dropdown (`"name"` → `"Name"`)                               |
| `toolbarExtra`     | Slot for page-specific buttons without bloating the generic component                         |
| `bodyRowClassName` | Lets pages override row styling while sharing structure                                       |


---

## Part 9: Wiring into `teachers-form.tsx`

### What stays in the form

- SWR data fetching (`getOrgMembers()`)
- Loading skeleton, error banner, empty state ("No teachers yet")
- Modals (add / edit teacher)
- Auth checks (`canManage`)

### What moves to `TeachersTable`

- Column definitions
- Sort/filter/pagination (via `DataTable`)
- Row actions (View button)

### Before → after

**Remove from form:**

```tsx
// ❌ No longer needed
const [searchQuery, setSearchQuery] = useState("");
const filteredTeachers = useMemo(() => { /* manual filter */ }, [...]);
// ❌ Manual <table> markup
```

**Add to form:**

```tsx
<TeachersTable
  teachers={teacherList}
  canManage={canManage}
  currentUserId={user?.id}
  addLoading={addLoading}
  disabled={controlsDisabled}
  onViewTeacher={openEditTeacherDialog}
/>
```

**Why keep loading/error/empty outside `DataTable`?**

Those states depend on **fetch status**, not table state. The table only renders when `teacherList.length > 0`. Mixing SWR concerns into `DataTable` would couple it to your API — bad for reuse on other pages.

---

## Part 10: Row selection (optional, for future tables)

Row selection is wired in `DataTable` but off by default (`enableRowSelection={false}`).

To enable it on a future page:

1. Add `createSelectColumn()` as the first column:

```tsx
const columns = useMemo(
  () => [
    createSelectColumn<TeacherMember>(),
    // ...other columns
  ],
  [],
);
```

1. Pass props to `DataTable`:

```tsx
<DataTable
  enableRowSelection
  bulkActions={
    <>
      <Button onClick={handleBulkExport}>Export</Button>
      <Button variant="destructive" onClick={handleBulkRemove}>Remove</Button>
    </>
  }
  // ...
/>
```

**Why off for Teachers?** There is no bulk-remove API wired up. Selection UI without actions confuses users.

---

## Part 11: Styling — what you kept vs what changed


| Kept (your RMS style)        | Changed (from template)              |
| ---------------------------- | ------------------------------------ |
| `hover:bg-primary/5` on rows | Toolbar with search + View dropdown  |
| Font weights on name/email   | Pagination footer                    |
| Blue "View" button           | Sortable headers with icons          |
| "You" badge for current user | Border wrapper around table + footer |


TanStack doesn't care about CSS. All styling stays in your Shadcn components and Tailwind classes — that's the point of headless UI.

---

## Part 12: Common mistakes

### 1. Forgetting `"use client"`

`useTable` uses hooks → file must be a Client Component.

### 2. Looping over `data` instead of `getRowModel()`

```tsx
// ❌ Bypasses sort, filter, pagination
{data.map((row) => ...)}

// ✅ Correct
{table.getRowModel().rows.map((row) => ...)}
```

### 3. Missing `getRowId`

Selection and keys break after reordering.

### 4. Columns not memoized

Causes performance issues and unstable behavior when cells close over props.

### 5. Filter on wrong column

If `searchColumn="email"` but your custom `filterFn` is on `name`, search won't behave as expected. Align `searchColumn` with the column that owns `filterFn`.

### 6. v8 tutorials with v9 installed

`useReactTable` → `useTable`. Features must be registered explicitly.

---

## Part 13: Practice exercises

Try these to solidify understanding (don't peek at the finished files first):

1. **Minimal table** — Render 3 hardcoded teachers with only Name and Email. No sorting yet.
2. **Add sorting** — Click Name header to toggle A→Z / Z→A. Add `SortIcon` feedback.
3. **Move search** — Add a filter input. Make it search both name and email via `filterFn`.
4. **Pagination** — Set `pageSize: 3`. Add prev/next buttons. Show total result count.
5. **Hide email** — Add column visibility toggle. Confirm actions column cannot be hidden.
6. **New page** — Create `students-table.tsx` for the Students page with columns: Name, Class, Actions. Reuse `DataTable`.
7. **Default sort** — Default to email descending instead of name ascending.
8. **Challenge** — Sync `pageIndex` to a `?page=2` URL query param (controlled pagination).

---

## Quick reference

### Files in this project


| File                                     | Responsibility                            |
| ---------------------------------------- | ----------------------------------------- |
| `shared-components/data-table.tsx`       | Generic table shell + TanStack setup      |
| `app/(main)/teachers/teachers-table.tsx` | Teacher column definitions                |
| `app/(main)/teachers/teachers-form.tsx`  | Data fetching, modals, page layout        |
| `app/(main)/table.tsx`                   | Original shadcn template (reference demo) |


### The render loop (copy this into your head)

```tsx
const table = useTable({ features, data, columns, getRowId, state, ... });

// Headers
table.getHeaderGroups().map → headers → flexRender(header)

// Rows (respects sort + filter + page)
table.getRowModel().rows.map → row.getVisibleCells() → flexRender(cell)
```

### Feature checklist for a full table

- [ ] `tableFeatures({ ... })` with needed features + row models
- [ ] Column defs with `accessorKey` or `id`
- [ ] Controlled state: `sorting`, `columnFilters`, `columnVisibility`, `rowSelection`
- [ ] `getRowId`
- [ ] `flexRender` in header and body loops
- [ ] Toolbar: filter input bound to `table.getColumn(id)?.setFilterValue`
- [ ] Footer: `previousPage` / `nextPage` + result count
- [ ] `useMemo` on columns when cells use props

---

## Further reading

- [TanStack Table v9 docs](https://tanstack.com/table/latest)
- [Migrating to v9 (React)](https://tanstack.com/table/latest/docs/framework/react/guide/migrating)
- [React Compiler guide (v9)](https://tanstack.com/table/v9/docs/framework/react/guide/react-compiler)

When you're ready to migrate another page, copy the **Teachers** pattern: create a `*-table.tsx` for columns, drop in `<DataTable />`, and leave fetch/modals in the form.