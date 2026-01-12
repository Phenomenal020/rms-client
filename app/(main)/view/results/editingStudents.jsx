import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Edit3, Loader2, Save, X } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shadcn/ui/form";
import { updateSelectedStudent } from "@/app/api/views/edit-student-action";

export function EditingStudents({
    isEditingStudent,
    startEditingStudent,
    saveStudentChanges,
    cancelEditingStudent,
    selectedStudent = {},
    academicTerm = {},
    isGlobalEditing,
}) {

    // refresh the page after the student information is updated
    const router = useRouter();

    // Use the useTransition hook to handle the loading state
    const [isPending, startTransition] = useTransition();

    // Form schema: only names + daysPresent
    const studentSchema = z.object({
        firstName: z.string().trim().min(1, "First name is required"),
        middleName: z.string().trim().optional(),
        lastName: z.string().trim().min(1, "Last name is required"),
        daysPresent: z.string().optional().refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0 && Number.isInteger(Number(value)), { message: "Days present must be a non-negative integer" })
    });

    // Form default values
    const formDefaults = {
        firstName: selectedStudent?.firstName,
        middleName: selectedStudent?.middleName || "",
        lastName: selectedStudent?.lastName,
        daysPresent: selectedStudent?.daysPresent || "",
    };

    // Use the useForm hook to handle the form submission
    const form = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues: formDefaults,
    });

    // Reset form when entering edit mode or when selected student changes
    useEffect(() => {
        form.reset(formDefaults);
    }, [isEditingStudent, selectedStudent?.id]);

    const handleStartEdit = () => {
        form.reset(formDefaults);
        startEditingStudent();  // invoke parent component's method to set isEditingStudent to true
    };

    const handleCancel = () => {
        form.reset(formDefaults);
        cancelEditingStudent();  // invoke parent component's method to set isEditingStudent to false
    };

    // Build payload: always include required fields; optional fields are sent only if dirty.
    // Empty dirty strings become null so the server clears them.
    const buildPayload = () => {
        const allValues = form.getValues();
        const { dirtyFields } = form.formState;

        const requiredKeys = ["firstName", "lastName"];
        const payload = {};

        // Always include required fields, trimmed if string
        requiredKeys.forEach((key) => {
            // get the value of each required field
            const value = allValues[key];
            // add this to the payload so they are always included in the payload
            payload[key] = typeof value === "string" ? value.trim() : value;
        });

        // Add ONLY dirty optional fields. If the value is not "", then set it to the value sent implying the user changed the value of this field. If the value is "", then set it to null implying the user cleared the field. This will prompt prisma to set that field to null in the db effectively clearing it.
        Object.entries(dirtyFields).forEach(([key, isDirty]) => {
            if (!isDirty || requiredKeys.includes(key)) return;

            const value = allValues[key];
            if (typeof value === "string") {
                const trimmed = value.trim();
                // if trimmed value is an empty string, set it to null
                payload[key] = trimmed === "" ? null : trimmed;
            } else {
                payload[key] = value;  // fallback for non-string values. Simply add them since they cannot be empty strings.
            }
        });
        return payload;
    };

    const onSubmit = async () => {
        const payload = buildPayload();
        const finalPayload = {
            id: selectedStudent?.id,
            ...payload,
            // subjects: selectedStudent.subjects,
        };

        startTransition(async () => {
            const result = await updateSelectedStudent(finalPayload);

            if (result?.error) {
                toast.error("Failed to update student", { description: 'Please review the form and try again.' });
                return;
            }

            toast.success("Student updated");
            saveStudentChanges({ ...selectedStudent, ...finalPayload });
            router.refresh();
        });
    };

    return (

        <div className="mb-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Edit student information section */}
                    <div className="flex items-center justify-between mb-3">

                        {/* Student information header text */}
                        <h3 className="text-xl font-bold text-gray-800 border-gray-300 pb-2">
                            STUDENT INFORMATION
                        </h3>

                        {/* Edit / Save / Cancel buttons */}
                        {!isEditingStudent ? (
                            <Button
                                onClick={handleStartEdit}
                                variant="outline"
                                size="sm"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                type="button"
                                disabled={isGlobalEditing}
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="bg-gray-800 hover:bg-gray-900 text-white cursor-pointer"
                                    disabled={isPending || !form.formState.isDirty}
                                >
                                    {isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                    disabled={isPending}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* More Editing options - student information */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            {/* First Name */}
                            {isEditingStudent ? (
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-3">
                                            <FormLabel className="font-semibold text-gray-700 w-32">
                                                First Name:
                                            </FormLabel>
                                            <div className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="flex-1 h-8 text-sm"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <div className="flex items-center">
                                    <span className="font-semibold text-gray-700 w-32">First Name:</span>
                                    <span className="text-gray-900">{selectedStudent?.firstName}</span>
                                </div>
                            )}

                            {/* Middle Name */}
                            {isEditingStudent ? (
                                <FormField
                                    control={form.control}
                                    name="middleName"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-3">
                                            <FormLabel className="font-semibold text-gray-700 w-32">
                                                Middle Name:
                                            </FormLabel>
                                            <div className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="flex-1 h-8 text-sm"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                selectedStudent?.middleName ? <div className="flex items-center">
                                    <span className="font-semibold text-gray-700 w-32">Middle Name:</span>
                                    <span className="text-gray-900">{selectedStudent?.middleName || ""}</span>
                                </div> : null
                            )}


                            {/* Last Name */}
                            {isEditingStudent ? (
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-3">
                                            <FormLabel className="font-semibold text-gray-700 w-32">
                                                Last Name:
                                            </FormLabel>
                                            <div className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="flex-1 h-8 text-sm"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <div className="flex items-center">
                                    <span className="font-semibold text-gray-700 w-32">Last Name:</span>
                                    <span className="text-gray-900">{selectedStudent?.lastName}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {/* Class - view only */}
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-700 w-32">Class:</span>
                                <span className="text-gray-900">{academicTerm?.class?.name}</span>
                            </div>

                            {/* Days Present - To edit days present */}
                            {isEditingStudent ? (
                                <FormField
                                    control={form.control}
                                    name="daysPresent"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-3">
                                            <FormLabel className="font-semibold text-gray-700 w-32">
                                                Days Present:
                                            </FormLabel>
                                            <div className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        className="flex-1 h-8 text-sm"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            ) : (selectedStudent?.daysPresent ?
                                <div className="flex items-center">
                                    <span className="font-semibold text-gray-700 w-32">Days Present:</span>
                                    <span className="text-gray-900">{selectedStudent?.daysPresent ?? 0}</span>
                                </div> : null
                            )}


                            {/* Total Days - view only */}
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-700 w-32">Term Days:</span>
                                <span className="text-gray-900">{academicTerm?.termDays ?? ''}</span>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}