'use client';

import { useEffect, useTransition } from "react";
import { Button } from "@/shadcn/ui/button";
import { Edit3, Save, X, Loader2 } from "lucide-react";
import { Form } from "@/shadcn/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    StudentResultTable,
    isSubjectEnrolled,
    type StudentSubjectRow,
} from "./student-result-table";
import type { Student, AssessmentStructure, AssessmentScore } from "@/types/drizzle";

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
        score: z.number().int().min(0).max(100),  // actual score value
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
                        {!readOnly && (
                            !isEditingScores ? (
                            <Button
                                type="button"
                                onClick={startEditingScores}
                                disabled={isGlobalEditing || !hasEnrolledSubject}
                                variant="outline"
                                size="sm"
                                className="border-border text-foreground hover:bg-muted cursor-pointer"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                            </Button>
                            ) : (
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
                                    type="button"
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
                            )
                        )}
                    </div>

                    {/* Result Table */}
                    <StudentResultTable
                        subjectRows={subjectRows}
                        assessmentStructure={assessmentStructure}
                        getGrade={getGrade}
                        getRemark={getRemark}
                        isEditingScores={isEditingScores}
                        readOnly={readOnly}
                        control={form.control}
                        watchedSubjects={watchedSubjects}
                    />
                </form>
            </Form>
        </div>
    )
}
