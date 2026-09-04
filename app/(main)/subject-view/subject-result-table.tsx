"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, getPaginatedSerialNumber, SortableHeader, TABLE_FEATURES } from "@/shared-components/data-table";
import { getScorePercentage } from "../students-view/utils/scoreFns";
import type { Student, AssessmentStructure, AssessmentScore, Subject } from "@/types/drizzle";

const reportHeadLeft =
    "border border-border p-2 md:p-3 text-left font-semibold text-foreground text-sm lg:text-base sticky left-0 z-20 bg-muted";
const reportHeadCenter =
    "border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm lg:text-base";
const reportCellLeft =
    "border border-border p-3 font-medium text-foreground text-sm lg:text-base whitespace-nowrap sticky left-0 z-10 bg-card";
const reportCellCenter = "border border-border p-1.5 md:p-3 text-center text-sm lg:text-base";

function getStudentDisplayName(student: Student): string {
    return [student.firstName, student.middleName || "", student.lastName]
        .filter(Boolean)
        .join(" ");
}

function getStudentSubjectScores(
    student: Student,
    selectedSubjectId: string | null,
): AssessmentScore[] {
    return (
        student.subjects?.find(
            (s: Subject) =>
                (s.subjectId ?? s.subject?.subjectId) === selectedSubjectId,
        )?.assessments?.[0]?.scores || []
    );
}

// Subject result table props
type SubjectResultTableProps = {
    enrolledStudents: Student[];
    selectedSubjectId: string | null;
    getGrade: (percentage: number) => string | null;
    getRemark: (grade: string | null) => string | null;
    assessmentStructure: AssessmentStructure[];
    readOnly?: boolean;
};

export function SubjectResultTable({
    enrolledStudents,
    selectedSubjectId,
    getGrade,
    getRemark,
    assessmentStructure,
}: SubjectResultTableProps) {
    // define columns of your table
    const columns = useMemo(() => {
        const assessmentColumns: ColumnDef<typeof TABLE_FEATURES, Student>[] =
            assessmentStructure.map((assessment) => ({
                id: `assessment-${assessment.id}`,
                enableSorting: true,
                accessorFn: (student) => {
                    const scores = getStudentSubjectScores(student, selectedSubjectId);
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
                    const scores = getStudentSubjectScores(row.original, selectedSubjectId);
                    const scoreValue =
                        scores.find(
                            (s: AssessmentScore) => s.assessmentStructureId === assessment.id,
                        )?.score ?? 0;

                    return <span className="text-foreground">{scoreValue}</span>;
                },
            }));

        return [
            // S/N column: row number across pages
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
            // Student column: sortable, filterable, and searchable
            {
                id: "student",
                accessorFn: (student) => getStudentDisplayName(student),
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
                    return getStudentDisplayName(row.original).toLowerCase().includes(query);
                },
                meta: {
                    headClassName: reportHeadLeft,
                    cellClassName: reportCellLeft,
                },
                cell: ({ row }) => {
                    const studentName = getStudentDisplayName(row.original);
                    return (
                        <span title={studentName}>{studentName}</span>
                    );
                },
            },
            // Assessment columns — dynamically generated from assessment structure
            ...assessmentColumns,
            // Total score column: sortable
            {
                id: "total",
                accessorFn: (student) =>
                    getScorePercentage(getStudentSubjectScores(student, selectedSubjectId)),
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
                    const scores = getStudentSubjectScores(row.original, selectedSubjectId);
                    return <span>{getScorePercentage(scores)}</span>;
                },
            },
            // Grade column: sortable
            {
                id: "grade",
                accessorFn: (student) => {
                    const scores = getStudentSubjectScores(student, selectedSubjectId);
                    return getGrade(getScorePercentage(scores)) ?? "";
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
                    const scores = getStudentSubjectScores(row.original, selectedSubjectId);
                    return <span>{getGrade(getScorePercentage(scores))}</span>;
                },
            },
            // Remark column: sortable
            {
                id: "remark",
                accessorFn: (student) => {
                    const scores = getStudentSubjectScores(student, selectedSubjectId);
                    const grade = getGrade(getScorePercentage(scores));
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
                    const scores = getStudentSubjectScores(row.original, selectedSubjectId);
                    const grade = getGrade(getScorePercentage(scores));
                    return <span>{getRemark(grade)}</span>;
                },
            },
        ] satisfies ColumnDef<typeof TABLE_FEATURES, Student>[];
    }, [assessmentStructure, getGrade, getRemark, selectedSubjectId]);

    // Finally, render the subject result table with meaningful defaults
    return (
        <DataTable
            data={enrolledStudents}
            columns={columns}
            getRowId={(row) => row.id ?? getStudentDisplayName(row)}
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
