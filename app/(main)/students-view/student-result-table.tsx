"use client";

// Read-only table. All mutations happen in /subject-view
import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import type { AssessmentStructure } from "@/types/drizzle";
import type { ClassRecordSubjectRow } from "@/fetcher/queries";
import { DataTable, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";
import { formatGradeDisplay, formatRemarkDisplay, formatScoreDisplay, NO_SCORE, isSubjectEnrolled, getSubjectAssessmentScoreValue, getSubjectTotalFromScores } from "./helpers";

export type StudentResultTableRow = {
  subjectRow: ClassRecordSubjectRow;
  sourceIndex: number;
};
const reportHeadLeft =
  "border border-border p-2 md:p-3 text-left font-semibold text-foreground text-sm lg:text-base sticky left-0 z-20 bg-muted";
const reportHeadCenter =
  "border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm lg:text-base";
const reportCellLeft =
  "border border-border p-3 font-medium text-foreground text-sm lg:text-base whitespace-nowrap sticky left-0 z-10 bg-card";
const reportCellCenter = "border border-border p-1.5 md:p-3 text-center text-sm lg:text-base";

// Format the total display
function formatTotalDisplay(total: number): string {
  return total === NO_SCORE ? "-" : String(total);
}

// Props for the StudentResultTable component
type StudentResultTableProps = {
  subjectRows: ClassRecordSubjectRow[];
  assessmentStructure: AssessmentStructure[];
  getGrade: (percentage: number) => string | null;
  getRemark: (grade: string | null) => string | null;
};

// StudentResultTable component
export function StudentResultTable({ subjectRows, assessmentStructure, getGrade, getRemark }: StudentResultTableProps) {
  const tableRows = useMemo(() => subjectRows.map((subjectRow, sourceIndex) => ({ subjectRow, sourceIndex })), [subjectRows]);

  const columns = useMemo(() => {
    // Assessment columns
    const assessmentColumns: ColumnDef<typeof TABLE_FEATURES, StudentResultTableRow>[] =
      assessmentStructure.map((assessment) => ({
        id: `assessment-${assessment.id}`,
        enableSorting: true,
        accessorFn: (row) =>
          isSubjectEnrolled(row.subjectRow)
            ? getSubjectAssessmentScoreValue(row.subjectRow, assessment.id)
            : NO_SCORE,
        header: ({ column }) => (
          <SortableHeader
            label={`${assessment.type} (${assessment.percentage}%)`}
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
            align="left"
          />
        ),
        meta: {
          headClassName: reportHeadCenter,
          cellClassName: reportCellCenter,
        },
        cell: ({ row }) => {
          const { subjectRow } = row.original;
          if (!isSubjectEnrolled(subjectRow)) {
            return <span className="text-foreground">-</span>;
          }
          const scoreValue = getSubjectAssessmentScoreValue(subjectRow, assessment.id);
          return <span className="text-foreground">{formatScoreDisplay(scoreValue)}</span>;
        },
      }));

    // Subject column
    return [
      {
        id: "subject",
        accessorFn: (row) => row.subjectRow.subject.name,
        header: ({ column }) => (
          <SortableHeader
            label="Subject"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        filterFn: (row, _id, value: string) => {
          const query = value.toLowerCase();
          return row.original.subjectRow.subject.name.toLowerCase().includes(query);
        },
        meta: {
          headClassName: reportHeadLeft,
          cellClassName: reportCellLeft,
        },
        cell: ({ row }) => (
          <span title={row.original.subjectRow.subject.name}>
            {row.original.subjectRow.subject.name}
          </span>
        ),
      },
      ...assessmentColumns,
      // Total column
      {
        id: "total",
        accessorFn: (row) => {
          if (!isSubjectEnrolled(row.subjectRow)) return NO_SCORE;
          return getSubjectTotalFromScores(row.subjectRow, assessmentStructure);
        },
        header: ({ column }) => (
          <SortableHeader
            label="Total (100%)"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
            align="left"
          />
        ),
        meta: {
          headClassName: reportHeadCenter,
          cellClassName: `${reportCellCenter} font-semibold text-foreground`,
        },
        cell: ({ row }) => {
          const { subjectRow } = row.original;
          if (!isSubjectEnrolled(subjectRow)) {
            return <span>-</span>;
          }
          const total = getSubjectTotalFromScores(subjectRow, assessmentStructure);
          return <span>{formatTotalDisplay(total)}</span>;
        },
      },
      // Grade column
      {
        id: "grade",
        accessorFn: (row) => {
          if (!isSubjectEnrolled(row.subjectRow)) return "";
          const total = getSubjectTotalFromScores(row.subjectRow, assessmentStructure);
          if (total === NO_SCORE) return "";
          return getGrade(total) ?? "";
        },
        header: ({ column }) => (
          <SortableHeader
            label="Grade"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
            align="left"
          />
        ),
        meta: {
          headClassName: reportHeadCenter,
          cellClassName: `${reportCellCenter} font-bold text-foreground`,
        },
        cell: ({ row }) => {
          const { subjectRow } = row.original;
          if (!isSubjectEnrolled(subjectRow)) {
            return <span>-</span>;
          }
          const total = getSubjectTotalFromScores(subjectRow, assessmentStructure);
          return <span>{formatGradeDisplay(total, getGrade)}</span>;
        },
      },
      // Remark column
      {
        id: "remark",
        accessorFn: (row) => {
          if (!isSubjectEnrolled(row.subjectRow)) return "";
          const total = getSubjectTotalFromScores(row.subjectRow, assessmentStructure);
          if (total === NO_SCORE) return "";
          const grade = getGrade(total);
          return getRemark(grade) ?? "";
        },
        header: ({ column }) => (
          <SortableHeader
            label="Remark"
            sorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
            align="left"
          />
        ),
        meta: {
          headClassName: reportHeadCenter,
          cellClassName: `${reportCellCenter} text-foreground`,
        },
        cell: ({ row }) => {
          const { subjectRow } = row.original;
          if (!isSubjectEnrolled(subjectRow)) {
            return <span>-</span>;
          }
          const total = getSubjectTotalFromScores(subjectRow, assessmentStructure);
          return <span>{formatRemarkDisplay(total, getGrade, getRemark)}</span>;
        },
      },
    ] satisfies ColumnDef<typeof TABLE_FEATURES, StudentResultTableRow>[];
  }, [assessmentStructure, getGrade, getRemark]);

  // Return the StudentResultTable component
  return (
    <div className="mb-8">
      <h3 className="text-base sm:text-lg font-bold text-foreground border-border mb-1 md:mb-2">
        ACADEMIC PERFORMANCE
      </h3>
      <DataTable
        data={tableRows}
        columns={columns}
        getRowId={(row) => row.subjectRow.subjectId ?? String(row.sourceIndex)}
        searchColumn="subject"
        searchPlaceholder="Search subjects…"
        columnLabels={{
          subject: "Subject",
          total: "Total",
          grade: "Grade",
          remark: "Remark",
        }}
        pageSize={10}
        defaultSorting={[{ id: "subject", desc: false }]}
        enableColumnVisibility={false}
        showPagination={subjectRows.length > 10}
        emptyMessage="No subjects available"
        containerClassName="overflow-x-auto rounded-none border border-border"
        tableClassName="w-full border-collapse text-sm text-left lg:text-base"
        headerRowClassName="bg-muted hover:bg-muted"
        bodyRowClassName="hover:bg-muted"
      />
    </div>
  );
}
