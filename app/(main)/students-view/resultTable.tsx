'use client';

import { useEffect, useRef, useTransition } from "react";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Edit3, Save, X, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getScorePercentage } from "./utils/scoreFns";
import type { Student, AssessmentStructure, AssessmentScore, StudentSubject } from "@/types/drizzle";

// check if the student is enrolled in the subject offering
type StudentSubjectRow = StudentSubject & { enrolled?: boolean };
function isSubjectEnrolled(row: StudentSubjectRow): boolean {
    return row.enrolled !== false;
}

// For each subject, return the assessment score and assessment structure id corr. to that score.
type FormSubjectRow = {
    subjectId: string;
    scores: { assessmentStructureId: string; score: number }[];
};
function mapSubjectRowsToFormSubjects(
    rows: StudentSubjectRow[],
    structures: AssessmentStructure[],
): FormSubjectRow[] {
    const asList = structures ?? [];
    return rows.map((row) => {
        const assessment = row.assessments?.[0];
        const subjectId = row.subjectId ?? row.subject?.subjectId ?? "";
        return {
            subjectId,
            scores: asList.map((as) => {
                const scoreEntry = assessment?.scores?.find(
                    (s: AssessmentScore) => s.assessmentStructureId === as.id,
                );
                return {
                    assessmentStructureId: as.id,
                    score: scoreEntry?.score ?? 0,  // fallback to 0 if no score is found
                };
            }),
        };
    });
}

// Component Props
interface ResultTableProps {
    isEditingScores: boolean;
    startEditingScores: () => void;
    handleSaveScores: (studentSubjects: Array<{ subjectId: string; scores: Array<{ assessmentStructureId: string; score: number }> }>) => Promise<void>;
    cancelEditingScores: () => void;
    selectedStudent: Student;
    getGrade: (percentage: number) => string | null;
    getRemark: (grade: string | null) => string | null;
    assessmentStructure: AssessmentStructure[];
    isGlobalEditing: boolean;
    /** When true, hide score editing (e.g. org-admin review of an export snapshot). */
    readOnly?: boolean;
}
export function ResultTable({ isEditingScores, startEditingScores, handleSaveScores, cancelEditingScores, selectedStudent, getGrade, getRemark, assessmentStructure = [], isGlobalEditing, readOnly = false }: ResultTableProps) {
    // Use transition hook
    const [isPending, startTransition] = useTransition();

    // Get the subjects the selected student is enrolled in
    const subjectRows: StudentSubjectRow[] = (selectedStudent?.subjects ?? []) as StudentSubjectRow[];
    const hasEnrolledSubject = subjectRows.some(isSubjectEnrolled);

    // Schema for a single score
    const assessmentEntrySchema = z.object({
        assessmentStructureId: z.uuid(),  // to identify type. eg, CA, Project, etc
        score: z.number().int().min(0),  // actual score value
    });

    // Schema for a row === an array of length assessment structure and schema a single score. 
    const expectedLen = assessmentStructure.length;
    const rowSchema = z.object({
        subjectId: z.string().min(1),  // subject id to identify the subject
        scores: z
            .array(assessmentEntrySchema)  // score per type
            .length(expectedLen, { message: `Expected ${expectedLen} scores` }),
    });

    // Whole table payload (result table shown by subjects and corresponding scores).
    // For subjects the student is not enrolled in, "-" is shown in the table.
    const tableSchema = z.object({
        subjects: z.array(rowSchema),
    });

    const form = useForm({
        resolver: zodResolver(tableSchema),
        defaultValues: {
            subjects: mapSubjectRowsToFormSubjects(subjectRows, assessmentStructure),
        },
    });

    // defaultValues only apply on mount; when the selected student (or their subjects) changes,
    // reset the form so watched values and field paths stay aligned with subjectRows.
    useEffect(() => {
        const rows = (selectedStudent?.subjects ?? []) as StudentSubjectRow[];
        form.reset({
            subjects: mapSubjectRowsToFormSubjects(rows, assessmentStructure),
        });
    }, [selectedStudent?.id, selectedStudent?.subjects, assessmentStructure, form]);

    // on submit, call the handleSaveScores function to save the scores to the database
    const onSubmit = (data: z.infer<typeof tableSchema>): void => {
        startTransition(async () => {
            const filtered = data.subjects.filter((_, index) =>
                isSubjectEnrolled(subjectRows[index]),
            );
            await handleSaveScores(filtered);
        });
    };

    // Watch form values so we can show live totals while editing
    const watchedSubjects = form.watch("subjects");

    return (
        <div className="mb-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    {/* Academic Performance Title and Edit Scores Button */}
                    <div className="flex items-center justify-between mb-1 md:mb-2">

                        {/* Academic Performance Header Text */}
                        <h3 className="text-base sm:text-lg font-bold text-foreground border-border">
                            ACADEMIC PERFORMANCE
                        </h3>

                        {/* Edit Scores Button */}
                        {!readOnly && !isEditingScores ? (  // show edit icon if not editing scores
                            <Button
                                onClick={startEditingScores}
                                disabled={isGlobalEditing || !hasEnrolledSubject}
                                variant="outline"
                                size="sm"
                                className="border-border text-foreground hover:bg-muted cursor-pointer"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                            </Button>
                        ) : !readOnly ? (  // show save/cancel buttons if editing scores
                            <div className="flex gap-2">
                                {/* Save Scores Button */}
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isPending || !form.formState.isDirty}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                                >
                                    {isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save
                                </Button>
                                {/* Cancel Scores Button */}
                                <Button
                                    onClick={cancelEditingScores}
                                    variant="outline"
                                    size="sm"
                                    disabled={isPending}
                                    className="border-border text-foreground hover:bg-muted cursor-pointer"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        ) : null}
                    </div>

                    {/* Result Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-border ">
                            {/* Table headers - dynamically generated from assessment structure */}
                            <thead>
                                <tr className="bg-muted">
                                    {/* Subject Header */}
                                    <th className="border border-border p-2 md:p-3 text-left font-semibold text-foreground text-sm sm:text-base sticky left-0 z-20 bg-muted">
                                        Subject
                                    </th>
                                    {/* Assessment Headers */}
                                    {assessmentStructure.map((assessment) => (
                                        <th
                                            key={assessment.id}
                                            className="border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm sm:text-base"
                                        >
                                            {assessment.type} ({assessment.percentage}%)
                                        </th>
                                    ))}
                                    {/* Total Score Header */}
                                    <th className="border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm sm:text-base">
                                        Total (100%)
                                    </th>
                                    {/* Grade Header */}
                                    <th className="border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm sm:text-base">
                                        Grade
                                    </th>
                                    {/* Remark Header */}
                                    <th className="border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm sm:text-base">
                                        Remark
                                    </th>
                                </tr>
                            </thead>

                            {/* Table body - subjects and corresponding scores, grade, remark */}
                            <tbody>
                                {subjectRows.length > 0 ? (
                                    subjectRows.map((enrolledSubject, index: number) => {
                                        // Set rowActive to true if the subject is enrolled, false otherwise.
                                        const rowActive = isSubjectEnrolled(enrolledSubject);

                                        // Get scores from subject (original data); assessments is an array of { scores }
                                        const scores = enrolledSubject.assessments?.[0]?.scores || [];

                                        // Get watched form row for live updates (for total score)
                                        const formRow = watchedSubjects?.[index];
                                        const totalFromForm = formRow?.scores?.reduce(
                                            (sum: number, s: { assessmentStructureId: string; score: number }) => sum + (Number(s.score) || 0),
                                            0
                                        ) ?? 0;

                                        // Compute percentage: use form values when editing, original data otherwise
                                        const percentage = !readOnly && isEditingScores && rowActive
                                            ? totalFromForm
                                            : getScorePercentage(scores);
                                        const grade = getGrade(percentage);
                                        const remark = getRemark(grade);

                                        return (
                                            <tr key={index} className="hover:bg-muted">

                                                {/* Subject Name */}
                                                <td className="border border-border p-3 font-medium text-foreground text-sm sm:text-base whitespace-nowrap sticky left-0 z-10 bg-card">
                                                    {enrolledSubject.subject.name}
                                                </td>

                                                {/* Dynamically render assessment type columns (assessment headers) */}
                                                {assessmentStructure.map((assessment, scoreIndex) => {
                                                    const scoreValue = scores.find((s: AssessmentScore) => s.assessmentStructureId === assessment.id)?.score || 0;

                                                    return (
                                                        <td
                                                            key={assessment.id}
                                                            className="border border-border p-1.5 md:p-3 text-center text-sm sm:text-base"
                                                        >
                                                            {isEditingScores && rowActive && !readOnly ? (
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`subjects.${index}.scores.${scoreIndex}.score`}
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
                                                                                                : Number(e.target.value)
                                                                                        )
                                                                                    }
                                                                                    className="w-16 h-8 text-center text-xs sm:text-sm border-border focus:border-input"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            ) : (
                                                                <span className="text-foreground">
                                                                    {rowActive ? scoreValue : "—"}
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}

                                                {/* Total score */}
                                                <td className="border border-border p-3 text-center font-semibold text-foreground text-sm sm:text-base">
                                                    {percentage}
                                                </td>

                                                {/* Grade */}
                                                <td className="border border-border p-3 text-center font-bold text-foreground text-sm sm:text-base">
                                                    {grade}
                                                </td>

                                                {/* Remark */}
                                                <td className="border border-border p-3 text-center text-foreground text-sm sm:text-base">
                                                    {remark}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={assessmentStructure.length + 4}
                                            className="border border-border p-3 text-center text-muted-foreground text-sm sm:text-base"
                                        >
                                            No subjects available
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                </form>
            </Form>
        </div>
    )
}