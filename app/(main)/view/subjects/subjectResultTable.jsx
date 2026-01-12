import { useEffect, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shadcn/ui/form";
import { Edit3, Loader2, Save, X } from "lucide-react";
import { saveSubjectScores } from "@/app/api/views/edit-subject-action";

export const SubjectResultTable = ({
    isEditingScores,
    startEditingScores,
    saveScoreChanges,
    cancelEditingScores,
    editingStudents = [],
    enrolledStudents = [],
    selectedSubjectName = "",
    getStudentScores,
    getGrade,
    getRemark,
    assessmentStructure = [],
    isGlobalEditing,
    academicTermId,
}) => {
    const [isPending, startTransition] = useTransition();

    // Use editing students if editing, otherwise use enrolled students
    const students = isEditingScores ? editingStudents : enrolledStudents;

    // Use assessment structure in the order it was added (preserve database order)
    const sortedAssessments = assessmentStructure || [];

    // Schema for a single score
    const assessmentEntrySchema = z.object({
        assessmentStructureId: z.string().min(1), // id of the assessment structure
        score: z.number().int().min(0), // score value
    });

    // Schema for a row === an array of length assessment structure and schema a single score.
    const expectedLen = sortedAssessments.length;
    const rowSchema = z.object({
        studentId: z.string().min(1),
        scores: z
            .array(assessmentEntrySchema) // score per type
            .length(expectedLen, { message: `Expected ${expectedLen} scores` }),
    });

    // Whole table payload
    const tableSchema = z.object({
        students: z.array(rowSchema),
    });

    // Build default values from current students list
    const buildDefaultValues = () => ({
        students: (students || []).map((student) => {
            // Find the subject entry for the selected subject
            const studentSubject = student.subjects?.find(
                (s) =>
                    s.subject?.name === selectedSubjectName ||
                    s.name === selectedSubjectName 
            );

            const assessment = studentSubject?.assessments?.[0];  // assessment is the first index of the assessments array

            return {  // to match the (expected) schems
                studentId: String(student.id ?? student.studentId ?? ""),
                scores: (sortedAssessments || []).map((as) => {
                    const scoreEntry = assessment?.scores?.find(  // find the score for the assessment structure
                        (s) => s.assessmentStructureId === as.id || s.assessmentStructure?.type === as.type  // by id or type
                    );

                    return {
                        assessmentStructureId: as.id,
                        score: scoreEntry?.score ?? 0,  // find the score for that entry or default to 0
                    };
                }),
            };
        }),
    });

    // Form setup
    const form = useForm({
        resolver: zodResolver(tableSchema),
        defaultValues: buildDefaultValues(),
    });

    // Reset form when subject, edit mode, or data source changes
    useEffect(() => {
        form.reset(buildDefaultValues());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubjectName, isEditingScores, enrolledStudents, editingStudents]);

    // On submit, save the scores to the database
    const onSubmit = (data) => {
        startTransition(async () => {
            try {
                // Get subjectId from the first enrolled student's subject data
                const firstStudent = enrolledStudents[0];
                if (!firstStudent) {
                    toast.error("No students found");
                    return;
                }

                // Get the student subject from the first enrolled student
                const studentSubject = firstStudent.subjects?.find(
                    (s) =>
                        s.subject?.name === selectedSubjectName ||
                        s.name === selectedSubjectName 
                );

                // Get subjectId - could be from subject.id or subjectId field
                const subjectId = studentSubject?.subject?.id || studentSubject?.subjectId;

                if (!subjectId) {
                    toast.error("Subject not found");
                    return;
                }

                if (!academicTermId) {
                    toast.error("Academic term is required");
                    return;
                }

                // Transform form data to match server action format
                const studentsData = data.students.map((student) => ({
                    studentId: student.studentId,
                    scores: student.scores.map((score) => ({
                        assessmentStructureId: score.assessmentStructureId,
                        score: Number(score.score) || 0,
                    })),
                }));

                // Call server action to save scores
                const result = await saveSubjectScores(
                    subjectId,
                    academicTermId,
                    studentsData
                );

                if (result.error) {
                    toast.error("Failed to save scores. Please try again.");
                    return;
                }

                // Update local state via parent component
                await saveScoreChanges?.(data.students);

                toast.success("Scores saved successfully");
            } catch (error) {
                toast.error("Failed to save scores. Please try again.");
            }
        });
    };

    // Watch form values so we can show live totals while editing
    const watchedStudents = form.watch("students");

    return (
        <div className="mb-8">

            {/* Academic Performance Title and Edit Scores Button */}
            <div className="flex items-center justify-between mb-4">

                {/* Academic Performance Title */}
                <h3 className="text-xl font-bold text-gray-800 border-gray-300 pb-2">
                    ACADEMIC PERFORMANCE
                </h3>

                {/* Edit Scores Button */}
                {!isEditingScores ? (
                    <Button
                        onClick={startEditingScores}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                        disabled={isGlobalEditing}
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        {/* Save Scores Button */}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending || !form.formState.isDirty}
                            className="bg-gray-800 hover:bg-gray-900 text-white cursor-pointer"
                            onClick={form.handleSubmit(onSubmit)}
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
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* Result Table */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            {/* Table headers - dynamically generated from assessment structure */}
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">
                                        Student Name
                                    </th>
                                    {sortedAssessments.map((assessment) => (
                                        <th
                                            key={assessment.type}
                                            className="border border-gray-300 p-3 text-center font-semibold text-gray-700"
                                        >
                                            {assessment.type} ({assessment.percentage}%)
                                        </th>
                                    ))}
                                    <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                                        Total (100%)
                                    </th>
                                    <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                                        Grade
                                    </th>
                                    <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                                        Remark
                                    </th>
                                </tr>
                            </thead>

                            {/* Table body - students and corresponding scores, grade, remark */}
                            <tbody>
                                {students && students.length > 0 ? (
                                    students.map((student, index) => {
                                        const studentName =
                                            student.name ||
                                            [student.firstName, student.middleName || "", student.lastName]
                                                .filter(Boolean)
                                                .join(" ");

                                        // Determine scores based on edit mode
                                        const formRow = watchedStudents?.[index];

                                        const totalFromForm = formRow?.scores?.reduce(
                                            (sum, s) => sum + (Number(s.score) || 0),
                                            0
                                        ) ?? 0;

                                        const percentage = isEditingScores
                                            ? totalFromForm
                                            : (student.subjects?.find(
                                                (s) =>
                                                    s.subject?.name === selectedSubjectName ||
                                                    s.name === selectedSubjectName 
                                            )?.assessments?.[0]?.scores || []).reduce(
                                                (sum, s) => sum + (s.score || 0),
                                                0
                                            );

                                        const grade = getGrade(percentage);
                                        const remark = getRemark(grade);

                                        return (
                                            <tr key={student.id || student.studentId || index} className="hover:bg-gray-50">
                                                <td className="border border-gray-300 p-3 font-medium text-gray-900">
                                                    {studentName}
                                                </td>

                                                {/* Dynamically render assessment type columns */}
                                                {sortedAssessments.map((assessment) => {
                                                    const assessmentType = assessment.type;
                                                    const scoreIndex = sortedAssessments.findIndex(
                                                        (as) => as.type === assessmentType
                                                    );
                                                    const fieldName = `students.${index}.scores.${scoreIndex}.score`;
                                                    const scoreValue = isEditingScores
                                                        ? formRow?.scores?.[scoreIndex]?.score ?? 0
                                                        : (
                                                            student.subjects?.find(
                                                                (s) =>
                                                                    s.subject?.name === selectedSubjectName ||
                                                                    s.name === selectedSubjectName 
                                                            )?.assessments?.[0]?.scores?.find(
                                                                (s) => s.assessmentStructureId === assessment.id
                                                            )?.score || 0
                                                        );

                                                    return (
                                                        <td
                                                            key={assessmentType}
                                                            className="border border-gray-300 p-3 text-center"
                                                        >
                                                            {isEditingScores ? (
                                                                <FormField
                                                                    control={form.control}
                                                                    name={fieldName}
                                                                    render={({ field }) => (
                                                                        <FormItem className="mb-0">
                                                                            <FormLabel className="sr-only">
                                                                                {`${studentName} ${assessment.type}`}
                                                                            </FormLabel>
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
                                                                                    className="w-16 h-8 text-center text-sm border-gray-200 focus:border-gray-400"
                                                                                    disabled={isPending}
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            ) : (
                                                                <span className="text-gray-700">{scoreValue}</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}

                                                {/* Total score */}
                                                <td className="border border-gray-300 p-3 text-center font-semibold text-gray-900">
                                                    {percentage}
                                                </td>

                                                {/* Grade */}
                                                <td className="border border-gray-300 p-3 text-center font-bold text-gray-900">
                                                    {grade}
                                                </td>

                                                {/* Remark */}
                                                <td className="border border-gray-300 p-3 text-center text-gray-700">
                                                    {remark}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={sortedAssessments.length + 4} className="border border-gray-300 p-3 text-center text-gray-500">
                                            No students enrolled in this subject
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