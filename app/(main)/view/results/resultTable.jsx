'use client';

import { useEffect, useTransition } from "react";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Edit3, Save, X, Loader2 } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shadcn/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getScorePercentage } from "./utils/scoreFns";

export function ResultTable({
    isEditingScores,  // boolean to check if the scores are being edited
    startEditingScores,  // sets editingSubjects to the selected student's subjects
    handleSaveScores,  // calls a server action to update the scores in the db
    cancelEditingScores,  // cancels editing mode
    selectedStudent = {},  // the selected student
    getGrade,  // grade per subject function
    getRemark,  // remark per subject function
    assessmentStructure = [],  // assessment structure for the academic term    
    isGlobalEditing,
}) {
    const [isPending, startTransition] = useTransition();
    // Use selected student's enrolled subjects
    const enrolledSubjects = selectedStudent?.subjects || [];

    // Keep assessments in the defined order
    const sortedAssessments = assessmentStructure || [];

    // Schema for a single score
    const assessmentEntrySchema = z.object({
        assessmentStructureId: z.uuid(),  // to identify type. eg, CA, Project, etc
        score: z.number().int().min(0),  // actual score value
    });

    // Schema for a row === an array of length assessment structure and schema a single score. 
    const expectedLen = assessmentStructure.length;
    const rowSchema = z.object({
        subjectId: z.string().min(1),
        scores: z
            .array(assessmentEntrySchema)  // score per type
            .length(expectedLen, { message: `Expected ${expectedLen} scores` }),
    });

    // Whole table payload
    const tableSchema = z.object({
        subjects: z.array(rowSchema),
    });

    // use form to handle the form data and validation
    const form = useForm({
        resolver: zodResolver(tableSchema),  // validate the form data against the table schema
        defaultValues: {
            subjects: (enrolledSubjects || []).map((enrolledSubject) => {
                // assessments are stored on each enrolled subject
                const assessment = enrolledSubject.assessments?.[0];  // b/c prisma returns an array of assessments for each subject

                return {
                    subjectId: enrolledSubject.subjectId,  // enrolled subject id
                    scores: (assessmentStructure || []).map((as) => {
                        const scoreEntry = assessment?.scores?.find(
                            (s) => s.assessmentStructureId === as.id
                        );

                        return {
                            assessmentStructureId: as.id,
                            score: scoreEntry?.score ?? 0,
                        };
                    }),  // map the assessment structure to the scores
                };
            }),
        },
    });

    // use effect to reset the form when the selected student changes to get that student's enrolled subjects and assessments
    useEffect(() => {
        form.reset({
            subjects: (enrolledSubjects || []).map((enrolledSubject) => {
                const assessment = enrolledSubject.assessments?.[0];

                return {
                    subjectId: enrolledSubject.subjectId,
                    scores: (assessmentStructure || []).map((as) => {
                        const scoreEntry = assessment?.scores?.find(
                            (s) => s.assessmentStructureId === as.id
                        );

                        return {
                            assessmentStructureId: as.id,
                            score: scoreEntry?.score ?? 0,
                        };
                    }),
                };
            }),
        });
    }, [
        selectedStudent?.id,
        isEditingScores,
    ]);


    // on submit, call the handleSaveScores function to save the scores to the database
    const onSubmit = (data) => {
        startTransition(async () => {
            await handleSaveScores(data.subjects);
        });
    };


    return (
        <div className="mb-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    {/* Academic Performance Title and Edit Scores Button */}
                    <div className="flex items-center justify-between mb-4">

                        {/* Academic Performance Header Text */}
                        <h3 className="text-xl font-bold text-gray-800 border-gray-300 pb-2">
                            ACADEMIC PERFORMANCE
                        </h3>

                        {/* Edit Scores Button */}
                        {!isEditingScores ? (
                            <Button
                                onClick={startEditingScores}
                                disabled={isGlobalEditing}
                                variant="outline"
                                size="sm"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
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
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            {/* Table headers - dynamically generated from assessment structure */}
                            <thead>
                                <tr className="bg-gray-100">
                                    {/* Subject Header */}
                                    <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">
                                        Subject
                                    </th>
                                    {/* Assessment Headers */}
                                    {sortedAssessments.map((assessment) => (
                                        <th
                                            key={assessment.type}
                                            className="border border-gray-300 p-3 text-center font-semibold text-gray-700"
                                        >
                                            {assessment.type} ({assessment.percentage}%)
                                        </th>
                                    ))}
                                    {/* Total Score Header */}
                                    <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                                        Total (100%)
                                    </th>
                                    {/* Grade Header */}
                                    <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                                        Grade
                                    </th>
                                    {/* Remark Header */}
                                    <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                                        Remark
                                    </th>
                                </tr>
                            </thead>

                            {/* Table body - subjects and corresponding scores, grade, remark */}
                            <tbody>
                                {enrolledSubjects && enrolledSubjects.length > 0 ? (
                                    enrolledSubjects.map((enrolledSubject, index) => {

                                        // Get scores from subject
                                        const scores = enrolledSubject.assessments[0]?.scores || [];
                                        // Compute percentage, grade and remark
                                        const percentage = getScorePercentage(scores); // Already out of 100
                                        const grade = getGrade(percentage);
                                        const remark = getRemark(grade);

                                        return (
                                            <tr key={index} className="hover:bg-gray-50">

                                                {/* Subject Name */}
                                                <td className="border border-gray-300 p-3 font-medium text-gray-900">
                                                    {enrolledSubject.subject.name}
                                                </td>
                                                {/* Dynamically render assessment type columns (assessment headers) */}
                                                {sortedAssessments.map((assessment) => {
                                                    const assessmentType = assessment.type;
                                                    const scoreValue = scores.find((s) => s.assessmentStructureId === assessment.id)?.score || 0;
                                                    const scoreIndex = sortedAssessments.findIndex(
                                                        (as) => as.type === assessmentType
                                                    );

                                                    return (
                                                        <td
                                                            key={assessmentType}
                                                            className="border border-gray-300 p-3 text-center"
                                                        >
                                                            {isEditingScores ? (
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
                                                                                    className="w-16 h-8 text-center text-sm border-gray-200 focus:border-gray-400"
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
                                        <td
                                            colSpan={sortedAssessments.length + 4}
                                            className="border border-gray-300 p-3 text-center text-gray-500"
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
// 