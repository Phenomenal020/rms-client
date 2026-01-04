"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Plus, X, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateAssessmentStructure } from "@/app/api/subjects/assessment-actions";

// Assessment Structure Schema: id(string or number), type(string), percentage(number string), order(number)
const assessmentStructureSchema = z.object({
    id: z.string().optional(), // on creation, prisma will generate a uuid for the assessment structure. Subsequently, it will be used to render/update the assessment structure.
    type: z.string().trim().min(1, { message: "Assessment type is required" }),
    percentage: z
        .string()
        .refine((val) => {
            const num = parseFloat(val);  // Attempt to convert to a number
            return !isNaN(num) && num >= 0 && num <= 100;  // validate it's a number and is between 0 and 100
        }, { message: "Percentage must be between 0 and 100" }),
    order: z.number().int().min(1, { message: "Order must be a positive integer" }),  // to sort how these assessments appear in the result page (eg, CA-1, Project-2, Exam-3, etc.)
});

// Schema for the assessment structure form (should be an array of assessment structure objects)
const assessmentStructureFormSchema = z.object({
    assessmentStructure: z
        .array(assessmentStructureSchema) // array of assessment structure objects
        .min(1, { message: "At least one assessment component is required" })
        .refine( // refine the assessment structure to ensure the percentages total exactly 100%. If the percentages don't total 100%, do not allow the form to be submitted.
            (assessments) => {
                const total = assessments.reduce(
                    (accumulator, currentValue) => accumulator + (parseFloat(currentValue.percentage) || 0),
                    0
                );
                return total === 100;
            },
            { message: "Assessment percentages must total exactly 100%" }
        ),
});

// Assessment structure form component - handles assessment structure section only
export function AssessmentStructureForm({ assessmentStructure }) {

    // router
    const router = useRouter();

    // form instance
    const form = useForm({
        resolver: zodResolver(assessmentStructureFormSchema),
        defaultValues: {
            assessmentStructure: assessmentStructure
                ? assessmentStructure
                    .map((assess) => ({
                        id: assess.id || undefined, // use the id from the db or use undefined for the first time when no assessment structure exists yet in the db
                        type: assess.type || "",
                        percentage: String(assess.percentage) || "",
                        order: assess.order || "",
                    }))
                    .sort((a, b) => a.order - b.order) // Sort by order when initialising assessment structure array
                : [],
        },
    });

    // current assessment entry (only for editing entries)
    const [currentAssessmentEntry, setCurrentAssessmentEntry] = useState({
        id: null,
        type: "",
        percentage: "",
        order: "",  // order is a number, so it should be a string initially
    });

    // new assessment entry (only for adding new entries)
    const [newAssessmentEntry, setNewAssessmentEntry] = useState({
        id: null,
        type: "",
        percentage: "",
        order: "",  // order is a number, so it should be a string initially
    });

    // editing assessment index
    const [editingAssessmentIndex, setEditingAssessmentIndex] = useState(null);

    // react hook form helpers for dynamic arrays - assessment structure
    // assessmentFields: To render the assessment structure === Read
    // _appendAssessment: To add a new assessment entry === Create
    // _removeAssessment: To remove an assessment entry === Delete
    // _updateAssessment: To update an assessment entry === Update
    const { fields: assessmentFields, append: _appendAssessment, remove: _removeAssessment, update: _updateAssessment } = useFieldArray({
        control: form.control,
        name: "assessmentStructure",
        keyName: 'tempId'  // to avoid overwriting the id (from prisma) with the frontend id during update
    });

    // Update assessment entry: It is equal to the _updateAssessment function + validation checks.
    const updateAssessmentEntry = () => {
        // check if no assessment is selected for edit
        if (editingAssessmentIndex === null) {
            toast.error("No assessment selected for edit");
            return;
        }

        // Validate editingAssessmentIndex
        if (editingAssessmentIndex === null || editingAssessmentIndex === undefined || editingAssessmentIndex < 0 || editingAssessmentIndex >= assessmentFields.length) {
            toast.error("Invalid assessment entry");
            return;
        }

        // get the assessment type, percentage, and order from the updated entry
        const { id: currentAssessmentId, type, percentage, order } = currentAssessmentEntry;

        // Validate that type, percentage, and order are provided
        if (!type || !type.trim()) {
            toast.error("Assessment type is required");
            return;
        }

        if (!percentage || !percentage.trim()) {
            toast.error("Percentage is required");
            return;
        }

        if (!order || order === "") {
            toast.error("Order is required");
            return;
        }

        // Convert and validate percentage
        const percentageNum = parseFloat(percentage.trim());
        if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
            toast.error("Percentage must be a number between 0 and 100");
            return;
        }

        // Validate order
        const orderNum = Number(order);
        if (isNaN(orderNum) || orderNum < 1) {
            toast.error("Order must be a positive integer");
            return;
        }

        // Get current assessments
        const currentAssessments = form.getValues("assessmentStructure") || [];

        // Calculate current total 
        let currentTotal = currentAssessments.reduce(
            (sum, a) => sum + (parseFloat(a.percentage) || 0),
            0
        );
        // subtract the old percentage of the assessment entry to be updated from the current total
        const oldPercentage = parseFloat(currentAssessments[editingAssessmentIndex]?.percentage || 0);
        currentTotal = currentTotal - oldPercentage;

        // Check if total would exceed 100
        if (currentTotal + percentageNum > 100) {
            toast.error(`Total would exceed 100%. Current total: ${currentTotal}%`);
            return;
        }

        // Check for duplicate orders (excluding current entry)
        const duplicateOrder = currentAssessments.some((assess, idx) =>
            idx !== editingAssessmentIndex && assess.order === orderNum
        );
        if (duplicateOrder) {
            toast.error(`Order ${orderNum} is already used. Please choose a different order number.`);
            return;
        }

        // If all the validations pass, then Update the entry
        _updateAssessment(editingAssessmentIndex, {
            id: currentAssessmentId,
            type: type.trim(),
            percentage: percentage.trim(),
            order: Number(orderNum),
        });
        form.trigger("assessmentStructure"); // Trigger re-validation
        // Clear the editing assessment index
        setEditingAssessmentIndex(null);
        // Clear the current entry
        setCurrentAssessmentEntry({ id: null, type: "", percentage: "", order: "" });
    };

    // Add assessment entry to assessment structure (only for new entries): It is equal to the _appendAssessment function + validation checks.
    const addAssessmentEntry = () => {
        // get the assessment type, percentage, and order from the current assessment entry
        const { id: currentAssessmentId, type, percentage, order } = newAssessmentEntry;

        // Validate that type, percentage, and order are provided
        if (!type || !type.trim() || type.trim() === "") {
            toast.error("Assessment type is required");
            return;
        }

        if (!percentage || !percentage.trim() || percentage.trim() === "") {
            toast.error("Percentage is required");
            return;
        }

        if (!order || order === "") {
            toast.error("Order is required");
            return;
        }

        // convert the percentage to a number
        const percentageNum = parseFloat(percentage.trim());
        // Validate percentage
        if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
            toast.error("Percentage must be a number between 0 and 100");
            return;
        }

        // get the current assessments from the assessment structure
        const currentAssessments = form.getValues("assessmentStructure") || [];

        // Validate order is valid
        let orderNum = null;
        if (order) {
            orderNum = Number(order);
            if (isNaN(orderNum) || orderNum < 1) {
                toast.error("Order must be a positive integer");
                return;
            }
        }

        // Calculate current total - sum of all percentages in the assessment structure
        let currentTotal = currentAssessments.reduce(
            (sum, a) => sum + (parseFloat(a.percentage) || 0),
            0
        );

        // Check if total would exceed 100 (for new entries only)
        if (currentTotal + percentageNum > 100) {
            toast.error(`Total would exceed 100%. Current total: ${currentTotal}%`);
            return;
        }

        // Add new entry - orderNum is guaranteed to be valid at this point due to validation above
        const finalOrder = orderNum;

        // Check for duplicate orders
        const duplicateOrder = currentAssessments.some(assess => assess.order === finalOrder);
        if (duplicateOrder) {
            toast.error(`Order ${finalOrder} is already used. Please choose a different order number.`);
            return;
        }

        _appendAssessment({
            id: currentAssessmentId ?? undefined,
            type: type.trim(),
            percentage: percentage.trim(),
            order: Number(finalOrder),
        });
        form.trigger("assessmentStructure"); // Trigger re-validation

        // Clear the current entry
        setNewAssessmentEntry({ id: null, type: "", percentage: "", order: "" });
    };

    // Edit mode for assessments: on click of the edit icon (pencil). This would render the assessment in edit mode allowing the user to update the assessment type, percentage, and order. 
    const editAssessmentEntry = (index) => {

        // Validate index (check for null/undefined, not falsy, since 0 is a valid index)
        if (index === null || index === undefined || index < 0 || index >= assessmentFields.length) {
            toast.error("Invalid assessment entry");
            return;
        }
        // get the assessment entry to edit from the assessment structure
        const entryToEdit = form.getValues(`assessmentStructure.${index}`);

        // if the assessment entry to edit exists, set the editing index and initialise inline edit state
        if (entryToEdit) {
            setEditingAssessmentIndex(index);
            setCurrentAssessmentEntry({
                id: entryToEdit.id,
                type: entryToEdit.type,
                percentage: entryToEdit.percentage,
                order: entryToEdit.order,
            });
        } else {
            toast.error("Assessment entry not found");
        }
    };

    // Cancel edit mode for assessments
    const cancelEditAssessment = () => {
        // clear the editing assessment index
        setEditingAssessmentIndex(null);
        // clear the current entry
        setCurrentAssessmentEntry({ id: null, type: "", percentage: "", order: "" });
    };

    // Remove assessment entry: It is equal to the _removeAssessment function + validation checks.
    const removeAssessmentEntry = (index) => {
        _removeAssessment(index); // remove the assessment entry from the assessment structure with the _removeAssessment function from the useFieldArray hook
        form.trigger("assessmentStructure"); // Trigger re-validation
        // If we're editing this entry, cancel edit mode
        if (editingAssessmentIndex === index) {
            cancelEditAssessment();
        }
        // show a success toast message
        toast.success(`Assessment "${assessmentFields[index]?.type}" removed successfully!`);
    };

    // on submit function - update assessment structure
    async function onSubmit(data) {
        try {
            // Call server action to update assessment structure only
            const result = await updateAssessmentStructure(data.assessmentStructure);

            // Check if the request was successful
            if (result.error) {
                toast.error("Failed to update assessment structure", {
                    description: "Please review the form details and try again",
                });
                return;
            }

            // Success!
            toast.success("Assessment structure updated successfully");
            router.refresh();
        } catch (err) {
            console.error("Error submitting form:", err);
            toast.error("Failed to update assessment structure", {
                description: "An unexpected error occurred. Please try again.",
            });
        }
    }

    // loading state for the submit button
    const loading = form.formState.isSubmitting;

    return (
        <Card className="border shadow-md">
            <CardContent className="pt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Assessment Structure Section */}
                        <div className="space-y-5 mt-8">

                            {/* Assessment Structure Section Header */}
                            <div className="pb-2 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Assessment Structure</h3>
                            </div>

                            {/* Add/Edit Assessment Entry Description */}
                            <p className="text-sm text-gray-700 font-medium">Add assessment components (e.g., CA: 30%, Exam: 70%. Should equal 100%)</p>

                            {/* Add/Edit Assessment Entry */}
                            <div className="grid grid-cols-12 gap-2 items-end">

                                {/* Assessment Type Field */}
                                <div className="col-span-4">
                                    {/* Assessment Type Field */}
                                    <Input
                                        placeholder="Assessment Type (e.g., CA, Exam, Project)"
                                        value={newAssessmentEntry.type}
                                        onChange={(e) =>
                                            setNewAssessmentEntry({ ...newAssessmentEntry, type: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Percentage Field */}
                                <div className="col-span-3">
                                    <Input
                                        placeholder="Percentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={newAssessmentEntry.percentage}
                                        onChange={(e) =>
                                            setNewAssessmentEntry({ ...newAssessmentEntry, percentage: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Order Field */}
                                <div className="col-span-2">
                                    <Input
                                        placeholder="Order (1, 2, 3...)"
                                        type="text"
                                        value={newAssessmentEntry.order}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow empty string while typing
                                            if (value === "") {
                                                setNewAssessmentEntry({ ...newAssessmentEntry, order: "" });
                                                return;
                                            }
                                            // Parse as integer and validate it's a positive integer
                                            const intValue = parseInt(value, 10);
                                            // Check: valid integer, positive, and matches input exactly (prevents decimals, leading zeros, etc.)
                                            if (!isNaN(intValue) && intValue > 0 && String(intValue) === value.trim()) {
                                                setNewAssessmentEntry({ ...newAssessmentEntry, order: intValue });
                                            }
                                            // If invalid, don't update state (prevents invalid input without spamming errors)
                                        }}
                                    />
                                </div>

                                {/* Add Button */}
                                <div className="col-span-3">
                                    <Button
                                        type="button"
                                        onClick={addAssessmentEntry}
                                        className="w-full"
                                        disabled={editingAssessmentIndex !== null}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Display Assessment Entries if there are any */}
                            {assessmentFields.length > 0 && (() => {
                                const assessmentStructure = form.getValues("assessmentStructure") || [];

                                // Map assessmentFields with their corresponding entries and preserve index
                                const assessmentsWithIndex = assessmentFields.map((field, index) => {
                                    const entry = assessmentStructure[index];
                                    return {
                                        ...entry,
                                        originalIndex: index,
                                        fieldKey: field.tempId || field.id,
                                    };
                                });

                                // Sort by order field for display (handle null/undefined values)
                                const sortedAssessments = [...assessmentsWithIndex].sort((a, b) => {
                                    const orderA = a.order !== null && a.order !== undefined ? a.order : 999;
                                    const orderB = b.order !== null && b.order !== undefined ? b.order : 999;
                                    return orderA - orderB;
                                });

                                const total = assessmentStructure.reduce(
                                    (sum, a) => sum + (parseFloat(a.percentage) || 0),
                                    0
                                );

                                return (
                                    <div className="space-y-2">
                                        {sortedAssessments.map((entry) => {
                                            // get the original index of the assessment entry
                                            const originalIndex = entry.originalIndex;
                                            // check if the assessment entry is being edited
                                            const isEditing = editingAssessmentIndex === originalIndex;
                                            const displayEntry = isEditing ? currentAssessmentEntry : entry;

                                            return (
                                                <div
                                                    key={entry.fieldKey || entry.id || originalIndex}
                                                    className={`flex items-center justify-between p-3 rounded-md border ${isEditing
                                                        ? "bg-blue-50 border-blue-300"
                                                        : "bg-gray-50 border-gray-200"
                                                        }`}
                                                >
                                                    {/* If editing, show the input fields. Otherwise, show the assessment order, type and percentage span elements */}
                                                    <div className="flex items-center gap-3 flex-1">
                                                        {isEditing ? (
                                                            <>
                                                                {/* Order Input */}
                                                                <Input
                                                                    type="text"
                                                                    value={displayEntry.order ?? ""}
                                                                    onChange={(e) => setCurrentAssessmentEntry({ ...currentAssessmentEntry, order: e.target.value })}
                                                                    className="w-16"
                                                                    placeholder="Order"
                                                                />
                                                                {/* Type Input */}
                                                                <Input
                                                                    type="text"
                                                                    value={displayEntry.type ?? ""}
                                                                    onChange={(e) => setCurrentAssessmentEntry({ ...currentAssessmentEntry, type: e.target.value })}
                                                                    className="flex-1"
                                                                    placeholder="Type"
                                                                />
                                                                {/* Percentage Input */}
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={displayEntry.percentage ?? ""}
                                                                    onChange={(e) => setCurrentAssessmentEntry({ ...currentAssessmentEntry, percentage: e.target.value })}
                                                                    className="w-24"
                                                                    placeholder="%"
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm font-semibold text-gray-500 min-w-[2rem]">
                                                                    #{displayEntry?.order || "—"}
                                                                </span>
                                                                <span className="text-gray-700 font-medium">
                                                                    {displayEntry?.type || ""}: {displayEntry?.percentage || 0}%
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Update/Cancel Edit Button or Edit/Remove Assessment Entry Button */}
                                                    <div className="flex items-center gap-2">
                                                        {/* if editing, show a ✓ and X icon */}
                                                        {isEditing ? (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={updateAssessmentEntry}
                                                                    className="text-green-500 hover:text-green-700"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={cancelEditAssessment}
                                                                    className="text-gray-500 hover:text-gray-700"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {/* Show the edit icon (pencil) and remove icon (trash) when not editing */}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => editAssessmentEntry(originalIndex)}
                                                                    className="text-blue-500 hover:text-blue-700"
                                                                    disabled={editingAssessmentIndex !== null}
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeAssessmentEntry(originalIndex)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                    disabled={editingAssessmentIndex !== null}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            {/* Total Percentage Display */}
                            {assessmentFields.length > 0 && (() => {
                                const total = form.watch("assessmentStructure").reduce(
                                    (sum, a) => sum + (parseFloat(a.percentage) || 0),
                                    0
                                );
                                return (
                                    <div className="text-right">
                                        <div className="space-y-1">
                                            <span
                                                className={`text-sm font-medium ${total === 100
                                                    ? "text-green-600"
                                                    : total > 100
                                                        ? "text-red-500"
                                                        : "text-orange-500"
                                                    }`}
                                            >
                                                Total: {total}%
                                            </span>
                                            {total !== 100 && (
                                                <p className="text-xs text-red-500">
                                                    {total < 100
                                                        ? "Total should be 100%. Please add more assessment components."
                                                        : "Total should be 100%. Please adjust the percentages."}
                                                </p>
                                            )}
                                            {total === 100 && (
                                                <p className="text-xs text-green-500">
                                                    Total is 100%. Assessment structure is valid.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Assessment Structure Validation Messages */}
                            <FormField
                                control={form.control}
                                name="assessmentStructure"
                                render={() => (
                                    <FormItem>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200 mt-6">
                            {/* Submit Button Container */}
                            <div className="flex justify-center">
                                <LoadingButton
                                    type="submit"
                                    disabled={loading || editingAssessmentIndex !== null}
                                    loading={loading}
                                    className="w-full sm:w-auto min-w-[160px] h-10 font-medium shadow-sm hover:shadow transition-shadow"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </LoadingButton>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

