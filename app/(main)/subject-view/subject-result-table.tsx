"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import type { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { DataTable, getPaginatedSerialNumber, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";
import type { AssessmentStructure } from "@/types/drizzle";
import type { SubjectRecordStudentRow } from "@/fetcher/queries";
import { formatScoreDisplay, getAssessmentScoreValue, getStudentTotalFromScores, NO_SCORE } from "./helpers";

const reportHeadLeft =
    "border border-border p-2 md:p-3 text-left font-semibold text-foreground text-sm lg:text-base sticky left-0 z-20 bg-muted";
const reportHeadCenter =
    "border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm lg:text-base";
const reportCellLeft =
    "border border-border p-3 font-medium text-foreground text-sm lg:text-base whitespace-nowrap sticky left-0 z-10 bg-card";
const reportCellCenter = "border border-border p-1.5 md:p-3 text-center text-sm lg:text-base";

export type SubjectResultTableRow = {
    student: SubjectRecordStudentRow;
    sourceIndex: number;
};

export type SubjectScoresFormValues = {
    students: Array<{
        studentId: string;
        scores: Array<{
            assessmentScoreId: string | null;
            assessmentStructureId: string;
            score: number;
        }>;
    }>;
};

// First name, middle name, and last name concatenated with a space between each
function getStudentDisplayName(student: SubjectRecordStudentRow): string {
    return [student.firstName, student.middleName || "", student.lastName]
        .filter(Boolean)
        .join(" ");
}

// Sum the scores from the form scores
function getTotalFromFormScores(
    formScores: SubjectScoresFormValues["students"][number]["scores"],
): number {
    return formScores.reduce((sum, { score }) => sum + Number(score ?? 0), 0);
}

// Resolve the student total score from the form scores or the student scores
function resolveStudentTotal(
    student: SubjectRecordStudentRow,
    assessmentStructure: AssessmentStructure[],
    watchedFormScores: SubjectScoresFormValues["students"][number]["scores"] | undefined,
    useFormScores: boolean,
): number {
    if (useFormScores && watchedFormScores) {
        return getTotalFromFormScores(watchedFormScores);
    }
    return getStudentTotalFromScores(student.scores, assessmentStructure);
}

// Format the total display
function formatTotalDisplay(total: number): string {
    return total === NO_SCORE ? "-" : String(total);
}

type SubjectResultTableProps = {
    enrolledStudents: SubjectRecordStudentRow[];
    getGrade: (percentage: number) => string | null;
    getRemark: (grade: string | null) => string | null;
    assessmentStructure: AssessmentStructure[];
    isEditingScores: boolean;
    readOnly?: boolean;
    control: Control<SubjectScoresFormValues>;
    watchedStudents?: SubjectScoresFormValues["students"];
};

export function SubjectResultTable({
    enrolledStudents,
    getGrade,
    getRemark,
    assessmentStructure,
    isEditingScores,
    readOnly = false,
    control,
    watchedStudents,
}: SubjectResultTableProps) {
    const tableRows = useMemo(
        () =>
            enrolledStudents.map((student, sourceIndex) => ({
                student,
                sourceIndex,
            })),
        [enrolledStudents],
    );

    const columns = useMemo(() => {
        const useFormScores = isEditingScores && !readOnly;

        // Create the assessment columns
        const assessmentColumns: ColumnDef<typeof TABLE_FEATURES, SubjectResultTableRow>[] =
            assessmentStructure.map((assessment, scoreIndex) => ({
                id: `assessment-${assessment.id}`,
                enableSorting: true,
                accessorFn: (row) =>
                    getAssessmentScoreValue(row.student.scores, assessment.id),
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
                    const { student, sourceIndex } = row.original;
                    const scoreValue = getAssessmentScoreValue(
                        student.scores,
                        assessment.id,
                    );

                    if (isEditingScores && !readOnly) {
                        return (
                            <FormField
                                control={control}
                                name={`students.${sourceIndex}.scores.${scoreIndex}.score`}
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
                        <span className="text-foreground">{formatScoreDisplay(scoreValue)}</span>
                    );
                },
            }));

        // Create the table columns
        return [
            // Serial number column
            {
                id: "serial",
                enableSorting: false,
                enableHiding: false,
                header: () => (
                    <span className="font-semibold text-muted-foreground">S/N</span>
                ),
                meta: {
                    headClassName: reportHeadCenter,
                    cellClassName: reportCellCenter,
                },
                cell: ({ row, table }) => (
                    <span className="font-medium text-foreground">
                        {getPaginatedSerialNumber(row, table)}
                    </span>
                ),
            },
            // Student name column
            {
                id: "student",
                accessorFn: (row) => getStudentDisplayName(row.student),
                header: ({ column }) => (
                    <SortableHeader
                        label="Student Name"
                        sorted={column.getIsSorted()}
                        onToggle={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    />
                ),
                filterFn: (row, _id, value: string) => {
                    const query = value.toLowerCase();
                    return getStudentDisplayName(row.original.student).toLowerCase().includes(query);
                },
                meta: {
                    headClassName: reportHeadLeft,
                    cellClassName: reportCellLeft,
                },
                cell: ({ row }) => {
                    const studentName = getStudentDisplayName(row.original.student);
                    return (
                        <span title={studentName}>{studentName}</span>
                    );
                },
            },
            ...assessmentColumns,
            // Total column
            {
                id: "total",
                accessorFn: (row) =>
                    resolveStudentTotal(
                        row.student,
                        assessmentStructure,
                        watchedStudents?.[row.sourceIndex]?.scores,
                        useFormScores,
                    ),
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
                    const total = resolveStudentTotal(
                        row.original.student,
                        assessmentStructure,
                        watchedStudents?.[row.original.sourceIndex]?.scores,
                        useFormScores,
                    );
                    return <span>{formatTotalDisplay(total)}</span>;
                },
            },
            // Grade column
            {
                id: "grade",
                accessorFn: (row) => {
                    const total = resolveStudentTotal(
                        row.student,
                        assessmentStructure,
                        watchedStudents?.[row.sourceIndex]?.scores,
                        useFormScores,
                    );
                    if (total === NO_SCORE) return "";
                    return getGrade(total) ?? "";
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
                    const total = resolveStudentTotal(
                        row.original.student,
                        assessmentStructure,
                        watchedStudents?.[row.original.sourceIndex]?.scores,
                        useFormScores,
                    );
                    if (total === NO_SCORE) {
                        return <span>-</span>;
                    }
                    return <span>{getGrade(total)}</span>;
                },
            },
            // Remark column
            {
                id: "remark",
                accessorFn: (row) => {
                    const total = resolveStudentTotal(
                        row.student,
                        assessmentStructure,
                        watchedStudents?.[row.sourceIndex]?.scores,
                        useFormScores,
                    );
                    if (total === NO_SCORE) return "";
                    const grade = getGrade(total);
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
                    const total = resolveStudentTotal(
                        row.original.student,
                        assessmentStructure,
                        watchedStudents?.[row.original.sourceIndex]?.scores,
                        useFormScores,
                    );
                    if (total === NO_SCORE) {
                        return <span>-</span>;
                    }
                    const grade = getGrade(total);
                    return <span>{getRemark(grade)}</span>;
                },
            },
        ] satisfies ColumnDef<typeof TABLE_FEATURES, SubjectResultTableRow>[];
    }, [
        assessmentStructure,
        control,
        getGrade,
        getRemark,
        isEditingScores,
        readOnly,
        watchedStudents,
    ]);

    return (
        <DataTable
            data={tableRows}
            columns={columns}
            getRowId={(row) => row.student.id ?? getStudentDisplayName(row.student)}
            searchColumn="student"
            searchPlaceholder="Search students…"
            columnLabels={{
                student: "Student Name",
                total: "Total",
                grade: "Grade",
                remark: "Remark",
            }}
            pageSize={10}
            defaultSorting={[{ id: "student", desc: false }]}
            enableColumnVisibility={false}
            emptyMessage="No students enrolled"
            containerClassName="overflow-x-auto rounded-none border border-border"
            tableClassName="w-full border-collapse text-sm text-left lg:text-base"
            headerRowClassName="bg-muted hover:bg-muted"
            bodyRowClassName="hover:bg-muted"
        />
    );
}
