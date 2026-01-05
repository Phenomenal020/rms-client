"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import { updateSchoolAndTerm } from "@/app/api/views/edit-school-actions";

// Handle empty email fields (should pass validation if the email is empty)
const emailSchema = z.preprocess(
    (val) => {
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
    },
    z.email("Invalid email address").optional()
);

// This component jointly edits the school information and the academic term information. Therefore, use a combined schema.
const schoolTermSchema = z.object({
    schoolName: z.string().trim().min(1, { message: "School name is required" }),
    schoolAddress: z.string().trim().optional(),
    schoolMotto: z.string().trim().optional(),
    schoolTelephone: z.string().trim().optional(),
    schoolEmail: emailSchema,
    academicYear: z.string().trim().min(1, { message: "Academic year is required" }),
    term: z.enum(["FIRST", "SECOND", "THIRD"], {
        errorMap: () => ({ message: "Please select a valid term" }),
    }),
});

export const SchoolHeader = ({
    isEditingSchool,
    startEditingSchool,
    saveSchoolChanges,
    cancelEditingSchool,
    editingSchoolData = {}, // school data being edited
    setEditingSchoolData: _setEditingSchoolData,
    school = {}, // school data from the database
    academicTerm = {}, // academic term data from the database
}) => {

    // Use the router to refresh the page after a successful update
    const router = useRouter();

    // Use the useTransition hook to handle the loading state
    const [isPending, startTransition] = useTransition();

    // Form defaults
    const formDefaults = {
        schoolName: editingSchoolData?.schoolName ?? school?.schoolName,
        schoolAddress: editingSchoolData?.schoolAddress ?? school?.schoolAddress ?? "",
        schoolMotto: editingSchoolData?.schoolMotto ?? school?.schoolMotto ?? "",
        schoolTelephone: editingSchoolData?.schoolTelephone ?? school?.schoolTelephone ?? "",
        schoolEmail: editingSchoolData?.schoolEmail ?? school?.schoolEmail ?? "",
        academicYear: academicTerm?.academicYear,
        term: academicTerm?.term,
    };


    // Use the useForm hook to handle the form submission
    const form = useForm({
        resolver: zodResolver(schoolTermSchema),
        defaultValues: formDefaults,
    });

    // reset the form when the editing state or school data changes
    useEffect(() => {
        form.reset(formDefaults);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isEditingSchool,
        school?.schoolName,
        school?.schoolAddress,
        school?.schoolMotto,
        school?.schoolTelephone,
        school?.schoolEmail,
        academicTerm?.academicYear,
        academicTerm?.term,  // TODO: Fix this
    ]);

    // Build payload: always include required fields; optional fields are sent only if dirty.
    // Empty dirty strings become null so the server clears them.
    const buildPayload = () => {
        const allValues = form.getValues();
        const { dirtyFields } = form.formState;

        const requiredKeys = ["schoolName", "academicYear", "term"];
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

    // Handle the cancel button click
    const handleCancel = () => {
        form.reset(formDefaults);
        cancelEditingSchool?.();
    };

    // The display data to render the form
    const displayData = {
        schoolName: school?.schoolName,
        schoolMotto: school?.schoolMotto,
        schoolAddress: school?.schoolAddress,
        schoolTelephone: school?.schoolTelephone,
        schoolEmail: school?.schoolEmail,
        academicYear: academicTerm?.academicYear,
        term: academicTerm?.term,
    };

    const onSubmit = async (data) => {
        // Although class name is not in the form data, it is required to update the term details. Therefore, get it from the academic term data.
        const className = academicTerm?.class?.name;
        if (!className) {
            toast.error("Missing class information", {
                description: "A class is required to update term details.",
            });
            return;
        }

        const payload = buildPayload();
        startTransition(async () => {  // ui update not immediately required
            const finalPayload = {
                ...payload,
                className,  // append the classname
            };
            const result = await updateSchoolAndTerm(finalPayload);

            if (result?.error) {
                toast.error("Failed to save school and term", {
                    description: "Please review the form and try again.",
                });
                return;
            }

            toast.success("School and term updated");
            // update local state with the new data
            saveSchoolChanges({ ...school, ...payload });
            cancelEditingSchool?.();
            router.refresh();
        });
    };

    return (
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-end mb-4">
                        {/* Edit School Info Button */}
                        {!isEditingSchool ? (
                            <Button
                                onClick={startEditingSchool}
                                variant="outline"
                                size="sm"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                type="button"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit School Info
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isPending}
                                    className="bg-gray-800 hover:bg-gray-900 text-white cursor-pointer"
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

                    {/* School Name */}
                    {isEditingSchool ? (
                        <FormField
                            control={form.control}
                            name="schoolName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="School Name"
                                            className="text-3xl font-bold text-center mb-2 p-3"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : (
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {displayData.schoolName}
                        </h1>
                    )}

                    {/* School Motto */}
                    {isEditingSchool ? (
                        <FormField
                            control={form.control}
                            name="schoolMotto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="School Motto"
                                            className="text-2xl text-center mb-2 p-3"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : (
                        <p className="text-2xl text-gray-700 mb-1">
                            {displayData.schoolMotto || ""}
                        </p>
                    )}

                    {/* School Address */}
                    {isEditingSchool ? (
                        <FormField
                            control={form.control}
                            name="schoolAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="School Address"
                                            className="text-lg text-center mb-2 p-3"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : (
                        <p className="text-lg text-gray-600 mb-1">
                            {displayData.schoolAddress || ""}
                        </p>
                    )}

                    {/* School Telephone and Email */}
                    <div className="flex flex-col items-center gap-2">
                        {isEditingSchool ? (
                            <>
                                <FormField
                                    control={form.control}
                                    name="schoolTelephone"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="School Phone"
                                                    className="text-sm text-center w-full p-3"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="schoolEmail"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="School Email"
                                                    className="text-sm text-center w-full p-3"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        ) : displayData.schoolTelephone || displayData.schoolEmail ? (
                            <p className="text-sm text-gray-500">
                                {displayData.schoolTelephone ? `Tel: ${displayData.schoolTelephone}` : null}{" "}
                                {displayData.schoolEmail ? `| Email: ${displayData.schoolEmail}` : null}
                            </p>
                        ) : null}
                    </div>

                    {/* Academic Year and Term */}
                    <h2 className="text-2xl font-bold text-gray-800 mt-3">
                        ACADEMIC REPORT CARD
                    </h2>

                    <div className="flex flex-col items-center gap-2 mt-2">
                        {isEditingSchool ? (
                            <>
                                <FormField
                                    control={form.control}
                                    name="academicYear"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="sr-only">Academic Year</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Academic Year"
                                                    className="text-sm text-center w-full p-3"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="term"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="sr-only">Term</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isPending}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="text-sm text-center w-full p-3">
                                                        <SelectValue placeholder="Select term" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="FIRST">First</SelectItem>
                                                    <SelectItem value="SECOND">Second</SelectItem>
                                                    <SelectItem value="THIRD">Third</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Academic Year: {displayData.academicYear} | Term: {displayData.term}
                            </p>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
};

