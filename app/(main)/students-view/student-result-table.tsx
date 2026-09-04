"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import type { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { DataTable, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";
import { getScorePercentage } from "./utils/scoreFns";
import type { AssessmentStructure, AssessmentScore, StudentSubject } from "@/types/drizzle";

// Row wrapper — keeps the original buffer index for form field paths when sorting/filtering
export type StudentSubjectRow = StudentSubject & { enrolled?: boolean };

export type StudentResultTableRow = {
    subjectRow: StudentSubjectRow;
    sourceIndex: number;
};

export function isSubjectEnrolled(row: StudentSubjectRow): boolean {
    return row.enrolled !== false;
}

const reportHeadLeft =
    "border border-border p-2 md:p-3 text-left font-semibold text-foreground text-sm lg:text-base sticky left-0 z-20 bg-muted";
const reportHeadCenter =
    "border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm lg:text-base";
const reportCellLeft =
    "border border-border p-3 font-medium text-foreground text-sm lg:text-base whitespace-nowrap sticky left-0 z-10 bg-card";
const reportCellCenter = "border border-border p-1.5 md:p-3 text-center text-sm lg:text-base";

// Student result table props
type StudentResultTableProps = {
    subjectRows: StudentSubjectRow[];
    assessmentStructure: AssessmentStructure[];
    getGrade: (percentage: number) => string | null;
    getRemark: (grade: string | null) => string | null;
    isEditingScores: boolean;
    readOnly?: boolean;
    control: Control<{ subjects: Array<{ subjectId: string; scores: Array<{ assessmentStructureId: string; score: number }> }> }>;
    watchedSubjects?: Array<{ subjectId: string; scores: Array<{ assessmentStructureId: string; score: number }> }>;
};

export function StudentResultTable({
    subjectRows,
    assessmentStructure,
    getGrade,
    getRemark,
    isEditingScores,
    readOnly = false,
    control,
    watchedSubjects,
}: StudentResultTableProps) {
    // Wrap rows with sourceIndex so edit form paths stay aligned after sort/filter
    const tableRows = useMemo(
        () =>
            subjectRows.map((subjectRow, sourceIndex) => ({
                subjectRow,
                sourceIndex,
            })),
        [subjectRows],
    );

    // define columns of your table
    const columns = useMemo(() => {
        const assessmentColumns: ColumnDef<typeof TABLE_FEATURES, StudentResultTableRow>[] =
            assessmentStructure.map((assessment, scoreIndex) => ({
                id: `assessment-${assessment.id}`,
                enableSorting: true,
                accessorFn: (row) => {
                    const scores = row.subjectRow.assessments?.[0]?.scores || [];
                    return (
                        scores.find(
                            (s: AssessmentScore) => s.assessmentStructureId === assessment.id,
                        )?.score ?? 0
                    );
                },
                header: ({ column }) => (
                    <SortableHeader
                        label={`${assessment.type} (${assessment.percentage}%)`}
                        sorted={column.getIsSorted()}
                        onToggle={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        align="left"
                    />
                ),
                meta: {
                    headClassName: reportHeadCenter,
                    cellClassName: reportCellCenter,
                },
                cell: ({ row }) => {
                    const { subjectRow, sourceIndex } = row.original;
                    const rowActive = isSubjectEnrolled(subjectRow);
                    const scores = subjectRow.assessments?.[0]?.scores || [];
                    const scoreValue =
                        scores.find(
                            (s: AssessmentScore) => s.assessmentStructureId === assessment.id,
                        )?.score || 0;

                    if (isEditingScores && rowActive && !readOnly) {
                        return (
                            <FormField
                                control={control}
                                name={`subjects.${sourceIndex}.scores.${scoreIndex}.score`}
                                render={({ field }) => (
                                    <FormItem className="mb-0">
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value ?? 0}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === ""
                                                            ? ""
                                                            : Number(e.target.value),
                                                    )
                                                }
                                                min={0}
                                                max={100}
                                                className="w-16 h-8 text-center text-xs sm:text-sm border-border focus:border-input"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        );
                    }

                    return (
                        <span className="text-foreground">{rowActive ? scoreValue : "—"}</span>
                    );
                },
            }));

        return [
            // Subject column: sortable, filterable, and searchable
            {
                id: "subject",
                accessorFn: (row) => row.subjectRow.subject.name,
                header: ({ column }) => (
                    <SortableHeader
                        label="Subject"
                        sorted={column.getIsSorted()}
                        onToggle={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
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
            // Assessment columns — dynamically generated from assessment structure
            ...assessmentColumns,
            // Total score column: sortable
            {
                id: "total",
                accessorFn: (row) => {
                    const { subjectRow, sourceIndex } = row;
                    const rowActive = isSubjectEnrolled(subjectRow);
                    const scores = subjectRow.assessments?.[0]?.scores || [];
                    const formRow = watchedSubjects?.[sourceIndex];
                    const totalFromForm =
                        formRow?.scores?.reduce(
                            (sum, s) => sum + (Number(s.score) || 0),
                            0,
                        ) ?? 0;

                    if (!readOnly && isEditingScores && rowActive) {
                        return totalFromForm;
                    }
                    return getScorePercentage(scores);
                },
                header: ({ column }) => (
                    <SortableHeader
                        label="Total (100%)"
                        sorted={column.getIsSorted()}
                        onToggle={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        align="left"
                    />
                ),
                meta: {
                    headClassName: reportHeadCenter,
                    cellClassName: `${reportCellCenter} font-semibold text-foreground`,
                },
                cell: ({ row }) => {
                    const { subjectRow, sourceIndex } = row.original;
                    const rowActive = isSubjectEnrolled(subjectRow);
                    const scores = subjectRow.assessments?.[0]?.scores || [];
                    const formRow = watchedSubjects?.[sourceIndex];
                    const totalFromForm =
                        formRow?.scores?.reduce(
                            (sum, s) => sum + (Number(s.score) || 0),
                            0,
                        ) ?? 0;
                    const percentage =
                        !readOnly && isEditingScores && rowActive
                            ? totalFromForm
                            : getScorePercentage(scores);

                    return <span>{percentage}</span>;
                },
            },
            // Grade column: sortable
            {
                id: "grade",
                accessorFn: (row) => {
                    const { subjectRow, sourceIndex } = row;
                    const rowActive = isSubjectEnrolled(subjectRow);
                    const scores = subjectRow.assessments?.[0]?.scores || [];
                    const formRow = watchedSubjects?.[sourceIndex];
                    const totalFromForm =
                        formRow?.scores?.reduce(
                            (sum, s) => sum + (Number(s.score) || 0),
                            0,
                        ) ?? 0;
                    const percentage =
                        !readOnly && isEditingScores && rowActive
                            ? totalFromForm
                            : getScorePercentage(scores);
                    return getGrade(percentage) ?? "";
                },
                header: ({ column }) => (
                    <SortableHeader
                        label="Grade"
                        sorted={column.getIsSorted()}
                        onToggle={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        align="left"
                    />
                ),
                meta: {
                    headClassName: reportHeadCenter,
                    cellClassName: `${reportCellCenter} font-bold text-foreground`,
                },
                cell: ({ row }) => {
                    const { subjectRow, sourceIndex } = row.original;
                    const rowActive = isSubjectEnrolled(subjectRow);
                    const scores = subjectRow.assessments?.[0]?.scores || [];
                    const formRow = watchedSubjects?.[sourceIndex];
                    const totalFromForm =
                        formRow?.scores?.reduce(
                            (sum, s) => sum + (Number(s.score) || 0),
                            0,
                        ) ?? 0;
                    const percentage =
                        !readOnly && isEditingScores && rowActive
                            ? totalFromForm
                            : getScorePercentage(scores);

                    return <span>{getGrade(percentage)}</span>;
                },
            },
            // Remark column: sortable
            {
                id: "remark",
                accessorFn: (row) => {
                    const { subjectRow, sourceIndex } = row;
                    const rowActive = isSubjectEnrolled(subjectRow);
                    const scores = subjectRow.assessments?.[0]?.scores || [];
                    const formRow = watchedSubjects?.[sourceIndex];
                    const totalFromForm =
                        formRow?.scores?.reduce(
                            (sum, s) => sum + (Number(s.score) || 0),
                            0,
                        ) ?? 0;
                    const percentage =
                        !readOnly && isEditingScores && rowActive
                            ? totalFromForm
                            : getScorePercentage(scores);
                    const grade = getGrade(percentage);
                    return getRemark(grade) ?? "";
                },
                header: ({ column }) => (
                    <SortableHeader
                        label="Remark"
                        sorted={column.getIsSorted()}
                        onToggle={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        align="left"
                    />
                ),
                meta: {
                    headClassName: reportHeadCenter,
                    cellClassName: `${reportCellCenter} text-foreground`,
                },
                cell: ({ row }) => {
                    const { subjectRow, sourceIndex } = row.original;
                    const rowActive = isSubjectEnrolled(subjectRow);
                    const scores = subjectRow.assessments?.[0]?.scores || [];
                    const formRow = watchedSubjects?.[sourceIndex];
                    const totalFromForm =
                        formRow?.scores?.reduce(
                            (sum, s) => sum + (Number(s.score) || 0),
                            0,
                        ) ?? 0;
                    const percentage =
                        !readOnly && isEditingScores && rowActive
                            ? totalFromForm
                            : getScorePercentage(scores);
                    const grade = getGrade(percentage);

                    return <span>{getRemark(grade)}</span>;
                },
            },
        ] satisfies ColumnDef<typeof TABLE_FEATURES, StudentResultTableRow>[];
    }, [
        assessmentStructure,
        control,
        getGrade,
        getRemark,
        isEditingScores,
        readOnly,
        watchedSubjects,
    ]);

    // Finally, render the student result table with meaningful defaults
    return (
        <DataTable
            data={tableRows}
            columns={columns}
            getRowId={(row) =>
                row.subjectRow.subjectId ??
                row.subjectRow.subject?.subjectId ??
                String(row.sourceIndex)
            }
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
    );
}
