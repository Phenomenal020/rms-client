"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent } from "@/shadcn/ui/card";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Trash2, Pencil, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { updateSubjects } from "@/app/api/subjects/actions";

// Assessment Structure Schema: id(string or number), type(string), percentage(number string), order(number)
const assessmentStructureSchema = z.object({
    id: z.string(),
    type: z.string().trim().min(1, { message: "Assessment type is required" }),
    percentage: z
        .string()
        .refine((val) => {
            const num = parseFloat(val);  // Attempt to convert to a number
            return !isNaN(num) && num >= 0 && num <= 100;  // validate it's a number and is between 0 and 100
        }, { message: "Percentage must be between 0 and 100" }),
    order: z.number().int().min(1, { message: "Order must be a positive integer" }),
});

// Subject schema: id(string or number), name(string)
const subjectSchema = z.object({
    id: z.string().or(z.number()),
    name: z.string().trim().min(1, { message: "Subject name is required" }),
});

// Schema for the subjects form
const subjectsFormSchema = z.object({
    subjects: z
        .array(subjectSchema) // array of subject objects
        .min(1, { message: "At least one subject is required" }), // at least one subject is required
    assessmentStructure: z
        .array(assessmentStructureSchema) // array of assessment structure objects
        .min(1, { message: "At least one assessment component is required" })
        .refine( // refine the assessment structure to ensure the percentages total exactly 100%
            (assessments) => {
                const total = assessments.reduce(
                    (accumulator, currentValue) => accumulator + (parseFloat(currentValue.percentage) || 0),
                    0
                );
                return total === 100;
            },
            { message: "" }   // Already being displayed to the user in the add assessment entry section  
        ),
});

// subjects form component
export function SubjectsForm({ user }) {

    // current assessment entry (only for adding new entries)
    const [currentAssessmentEntry, setCurrentAssessmentEntry] = useState({
        type: "",
        percentage: "",
        order: "",
    });

    // Inline editing state for assessment entries (keyed by index)
    const [inlineAssessmentEdits, setInlineAssessmentEdits] = useState({});


    // new subject name for custom subject
    const [newSubjectName, setNewSubjectName] = useState("");
    // current subject entry
    const [currentSubjectEntry, setCurrentSubjectEntry] = useState({
        name: "",
    });

    // editing assessment index
    const [editingAssessmentIndex, setEditingAssessmentIndex] = useState(null);
    // editing subject index
    const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);

    // router
    const router = useRouter();

    // Get the school from the user
    const school = user?.school;
    // Get subjects and assessment structure from the school
    const subjects = school?.subjects || [];
    const assessmentStructure = school?.assessmentStructure || [];

    // subjects form and assessment structure form
    const form = useForm({
        resolver: zodResolver(subjectsFormSchema), // validation
        defaultValues: {
            subjects: subjects.map((subject) => ({
                id: subject.id,
                name: subject.name,
            })), // initial form values for subjects from subjects array
            assessmentStructure: assessmentStructure
                .map((assess) => ({
                    id: assess.id,
                    type: assess.type,
                    percentage: String(assess.percentage),
                    order: assess.order,
                }))
                .sort((a, b) => a.order - b.order), // Sort by order when initialising assessment structure array
        },
    });

    // react hook form helpers for dynamic arrays - subjects
    // subjectFields: To render the subjects === Read
    // appendSubject: To add a new subject === Create
    // removeSubjectField: To remove a subject === Delete
    // updateSubjectField: To update a subject === Update
    const { fields: subjectFields, append: appendSubject, remove: removeSubjectField, update: updateSubjectField } = useFieldArray({
        control: form.control,
        name: "subjects",
    });

    // Likewise, for the assessment structure
    const { fields: assessmentFields, append: appendAssessment, remove: removeAssessmentField, update: updateAssessmentField } = useFieldArray({
        control: form.control,
        name: "assessmentStructure",
    });

    // ---------------------------------------------------------------------------

    // Add custom subject
    const addCustomSubject = () => {
        // if the new subject field is empty, show a toast message
        if (!newSubjectName.trim()) {
            toast.error("Subject name is required");
            return;
        }

        // get a list of all existing subject names
        const existingSubjectNames = form
            .getValues("subjects")
            .map((s) => s.name.toLowerCase());

        // if the subject name already exists, show a toast message
        if (existingSubjectNames.includes(newSubjectName.trim().toLowerCase())) {
            toast.error(`Subject "${newSubjectName}" already exists!`);
            setNewSubjectName(""); // clear the new subject field
            return;
        }

        // Otherwise, add the subject to the subjects form
        appendSubject({
            id: String(Date.now() + Math.random()),
            name: newSubjectName.trim(),
        });

        // show a success toast message
        toast.success(`Subject "${newSubjectName.trim()}" added successfully!`);
        setNewSubjectName(""); // clear the new subject field
    };

    // Edit mode for subjects
    const editSubjectEntry = (index) => {
        // Validate index (check for null/undefined, not falsy, since 0 is a valid index)
        if (index === null || index === undefined || index < 0 || index >= subjectFields.length) {
            toast.error("Invalid subject entry");
            return;
        }

        // get the subject entry to edit from the subjects form
        const entryToEdit = form.getValues(`subjects.${index}`);

        // if the subject entry to edit exists, set the current subject entry to the subject entry to edit
        if (entryToEdit) {
            setCurrentSubjectEntry({
                name: entryToEdit.name,
            });
            // set the editing subject index to the index of the subject entry to edit
            setEditingSubjectIndex(index);
        } else {
            toast.error("Subject entry not found");
        }
    };

    // Add/Update subject entry
    const addSubjectEntry = () => {
        // get the subject name from the current subject entry
        const { name } = currentSubjectEntry;

        // if the subject name is valid, add or update the subject entry
        if (name.trim()) {
            // get a list of all existing subject names
            const existingSubjectNames = form
                .getValues("subjects")
                .map((s) => s.name.toLowerCase());

            // if editing, exclude the current subject from the duplicate check
            const otherSubjects = editingSubjectIndex !== null
                ? existingSubjectNames.filter((_, i) => i !== editingSubjectIndex)
                : existingSubjectNames;

            // if the subject name already exists, show a toast message
            if (otherSubjects.includes(name.trim().toLowerCase())) {
                toast.error(`Subject "${name.trim()}" already exists!`);
                return;
            }

            // If editing, update the entry
            if (editingSubjectIndex !== null) {
                updateSubjectField(editingSubjectIndex, {
                    id: subjectFields[editingSubjectIndex].id,
                    name: name.trim(),
                });
                form.trigger("subjects"); // Trigger re-validation
                setEditingSubjectIndex(null);
            } else {
                // Add new entry
                appendSubject({
                    id: Date.now() + Math.random(),
                    name: name.trim(),
                });
                form.trigger("subjects"); // Trigger re-validation
            }

            // Clear the current entry
            setCurrentSubjectEntry({ name: "" });
        } else {
            toast.error("Subject name is required");
        }
    };

    // Cancel edit mode for subjects
    const cancelEditSubject = () => {
        // clear the current subject entry
        setCurrentSubjectEntry({ name: "" });
        // clear the editing subject index
        setEditingSubjectIndex(null);
    };

    // Remove subject entry
    const removeSubjectEntry = (index) => {
        removeSubjectField(index);
        form.trigger("subjects"); // Trigger re-validation
        // If we're editing this entry, cancel edit mode
        if (editingSubjectIndex === index) {
            cancelEditSubject();
        }
        // show a success toast message
        toast.success(`Subject "${subjectFields[index]?.name}" removed successfully!`);
    };

    // ---------------------------------------------------------------------------

    // Update assessment entry (for inline editing)
    const updateAssessmentEntry = (index, updatedEntry) => {
        // Validate index
        if (index === null || index === undefined || index < 0 || index >= assessmentFields.length) {
            toast.error("Invalid assessment entry");
            return;
        }

        const { type, percentage, order } = updatedEntry;

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

        // Calculate current total (subtract old percentage)
        let currentTotal = currentAssessments.reduce(
            (sum, a) => sum + (parseFloat(a.percentage) || 0),
            0
        );
        const oldPercentage = parseFloat(currentAssessments[index]?.percentage || 0);
        currentTotal -= oldPercentage;

        // Check if total would exceed 100
        if (currentTotal + percentageNum > 100) {
            toast.error(`Total would exceed 100%. Current total: ${currentTotal}%`);
            return;
        }

        // Check for duplicate orders (excluding current entry)
        const duplicateOrder = currentAssessments.some((assess, idx) =>
            idx !== index && assess.order === orderNum
        );
        if (duplicateOrder) {
            toast.error(`Order ${orderNum} is already used. Please choose a different order number.`);
            return;
        }

        // Update the entry
        updateAssessmentField(index, {
            id: assessmentFields[index].id,
            type: type.trim(),
            percentage: percentage.trim(),
            order: Number(orderNum),
        });
        form.trigger("assessmentStructure");
        setEditingAssessmentIndex(null);
    };

    // Add assessment entry to assessment structure (only for new entries)
    const addAssessmentEntry = () => {
        // get the assessment type, percentage, and order from the current assessment entry
        const { type = "", percentage = "", order = "" } = currentAssessmentEntry;

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

        // Validate total percentage score while editing
        if (editingAssessmentIndex !== null) {
            const oldPercentage = parseFloat(currentAssessments[editingAssessmentIndex]?.percentage || 0);
            currentTotal -= oldPercentage;
        }

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

        appendAssessment({
            id: String(Date.now() + Math.random()),
            type: type.trim(),
            percentage: percentage.trim(),
            order: Number(finalOrder),
        });
        form.trigger("assessmentStructure"); // Trigger re-validation

        // Clear the current entry
        setCurrentAssessmentEntry({ type: "", percentage: "", order: "" });
    };

    // Edit mode for assessments - set the editing index and initialize inline edit state
    const editAssessmentEntry = (index) => {
        // Validate index
        if (index === null || index === undefined || index < 0 || index >= assessmentFields.length) {
            toast.error("Invalid assessment entry");
            return;
        }

        // get the assessment entry to edit from the assessment structure
        const entryToEdit = form.getValues(`assessmentStructure.${index}`);

        // if the assessment entry to edit exists, set the editing index and initialize inline edit state
        if (entryToEdit) {
            setEditingAssessmentIndex(index);
            setInlineAssessmentEdits({
                ...inlineAssessmentEdits,
                [index]: {
                    type: entryToEdit.type || "",
                    percentage: entryToEdit.percentage ? String(entryToEdit.percentage) : "",
                    order: entryToEdit.order ? String(entryToEdit.order) : "",
                }
            });
        } else {
            toast.error("Assessment entry not found");
        }
    };

    // Cancel edit mode for assessments
    const cancelEditAssessment = () => {
        // clear the editing assessment index
        const currentEditIndex = editingAssessmentIndex;
        setEditingAssessmentIndex(null);
        // clear the inline edit state for this entry
        if (currentEditIndex !== null) {
            const newEdits = { ...inlineAssessmentEdits };
            delete newEdits[currentEditIndex];
            setInlineAssessmentEdits(newEdits);
        }
    };

    // Remove assessment entry
    const removeAssessmentEntry = (index) => {
        removeAssessmentField(index); // remove the assessment entry from the assessment structure with the removeAssessmentField function from the useFieldArray hook
        form.trigger("assessmentStructure"); // Trigger re-validation
        // If we're editing this entry, cancel edit mode
        if (editingAssessmentIndex === index) {
            cancelEditAssessment();
        }
    };

    // on submit function - update subjects + set status
    async function onSubmit(data) {
        try {
            // Call server action to update subjects and assessment structure
            const result = await updateSubjects({
                subjects: data.subjects,
                assessmentStructure: data.assessmentStructure,
            });

            // Check if the request was successful
            if (result.error) {
                toast.error("Failed to update subjects and assessment structure", {
                    description: result.error || "Please review the form details and try again",
                });
                return;
            }

            // Success!
            toast.success("Subjects and assessment structure updated successfully");
            router.refresh();
        } catch (err) {
            console.error("Error submitting form:", err);
            toast.error("Failed to update subjects and assessment structure", {
                description: "An unexpected error occurred. Please try again.",
            });
        }
    }

    const loading = form.formState.isSubmitting;

    return (
        <Card className="border shadow-md">
            <CardContent className="pt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Custom Subject Section */}
                        <div className="space-y-4 mt-8">

                            {/* Custom Subject Section Header */}
                            <div className="pb-2 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Add New Subject</h3>
                            </div>

                            {/* Add Custom Subject Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <FormLabel className="text-gray-700 font-semibold">Subject Name</FormLabel>
                                    <Input
                                        placeholder="e.g., Advanced Mathematics, Creative Writing"
                                        value={newSubjectName}
                                        onChange={(e) => setNewSubjectName(e.target.value)}
                                        className="transition-colors hover:border-gray-400 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <Button type="button" onClick={addCustomSubject} className="w-full cursor-pointer">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Custom Subject
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Subjects List Section */}
                        {subjectFields.length > 0 && (
                            <div className="space-y-6 mt-8 pt-8 border-t border-gray-200">

                                {/* Subjects List Section Header */}
                                <div className="pb-2 border-b border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Subjects</h3>
                                </div>

                                {/* For each subject */}
                                <div className="space-y-2">
                                    {subjectFields.map((subjectField, subjectIndex) => {
                                        const subject = form.getValues(`subjects.${subjectIndex}`);

                                        // return  Name, Edit icon, Remove icon 
                                        return (
                                            <div
                                                key={subjectField.id}
                                                className={`flex items-center justify-between p-3 rounded-md border ${editingSubjectIndex === subjectIndex
                                                    ? "bg-blue-50 border-blue-300"
                                                    : "bg-gray-50 border-gray-200"
                                                    }`}
                                            >

                                                {/* Subject Name */}
                                                {/* If editing, show the input field */}
                                                {editingSubjectIndex === subjectIndex ? (
                                                    <Input
                                                        type="text"
                                                        value={currentSubjectEntry.name}
                                                        onChange={(e) => setCurrentSubjectEntry({ name: e.target.value })}
                                                        className="flex-1 mr-2"
                                                        placeholder="Subject name"
                                                    />
                                                ) : (
                                                    // Otherwise, show the subject name
                                                    <span className="text-gray-700 font-medium">
                                                        {subject?.name || "Unnamed Subject"}
                                                    </span>
                                                )}

                                                {/* Edit and Remove icons */}
                                                <div className="flex items-center gap-2">
                                                    {editingSubjectIndex === subjectIndex ? (
                                                        <>
                                                            {/* Save Subject Button when field === editing field*/}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={addSubjectEntry}
                                                                className="text-green-500 hover:text-green-700"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            {/* Cancel Edit Subject Button when field === editing field*/}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={cancelEditSubject}
                                                                className="text-gray-500 hover:text-gray-700"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Else, show the edit and remove icons when field !== editing field*/}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => editSubjectEntry(subjectIndex)}
                                                                className="text-blue-500 hover:text-blue-700"
                                                                // Disable if any subject is being edited
                                                                disabled={editingSubjectIndex !== null}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            {/* Remove Subject Button */}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeSubjectEntry(subjectIndex)}
                                                                className="text-red-500 hover:text-red-700"
                                                                // Disable if any subject is being edited
                                                                disabled={editingSubjectIndex !== null}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Assessment Structure Section */}
                        <div className="space-y-5 mt-8 pt-8 border-t border-gray-200">

                            {/* Assessment Structure Section Header */}
                            <div className="pb-2 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Assessment Structure</h3>
                            </div>

                            <p className="text-sm text-gray-700 font-medium">Add assessment components (e.g., CA: 30%, Exam: 70%. Should equal 100%)</p>

                            {/* Add/Edit Assessment Entry */}
                            <div className="grid grid-cols-12 gap-2 items-end">
                                {/* Assessment Type Field */}
                                <div className="col-span-4">
                                    {/* Assessment Type Field */}
                                    <Input
                                        placeholder="Assessment Type (e.g., CA, Exam, Project)"
                                        value={currentAssessmentEntry.type}
                                        onChange={(e) =>
                                            setCurrentAssessmentEntry({ ...currentAssessmentEntry, type: e.target.value })
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
                                        value={currentAssessmentEntry.percentage}
                                        onChange={(e) =>
                                            setCurrentAssessmentEntry({ ...currentAssessmentEntry, percentage: e.target.value })
                                        }
                                    />
                                </div>
                                {/* Order Field */}
                                <div className="col-span-2">
                                    <Input
                                        placeholder="Order (1, 2, 3...)"
                                        type="text"
                                        value={currentAssessmentEntry.order}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow empty string while typing
                                            if (value === "") {
                                                setCurrentAssessmentEntry({ ...currentAssessmentEntry, order: "" });
                                                return;
                                            }
                                            // Parse as integer and validate it's a positive integer
                                            const intValue = parseInt(value, 10);
                                            // Check: valid integer, positive, and matches input exactly (prevents decimals, leading zeros, etc.)
                                            if (!isNaN(intValue) && intValue > 0 && String(intValue) === value.trim()) {
                                                setCurrentAssessmentEntry({ ...currentAssessmentEntry, order: intValue });
                                            }
                                            // If invalid, don't update state (prevents invalid input without spamming errors)
                                        }}
                                    />
                                </div>

                                {/* Add Button - only show when not editing */}
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
                                        fieldId: field.id,
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
                                            const originalIndex = entry.originalIndex;
                                            const isEditing = editingAssessmentIndex === originalIndex;
                                            const inlineEdit = inlineAssessmentEdits[originalIndex] || {
                                                type: entry?.type || "",
                                                percentage: entry?.percentage ? String(entry.percentage) : "",
                                                order: entry?.order ? String(entry.order) : "",
                                            };

                                            return (
                                                <div
                                                    key={entry.fieldId || entry.id}
                                                    className={`flex items-center justify-between p-3 rounded-md border ${isEditing
                                                        ? "bg-blue-50 border-blue-300"
                                                        : "bg-gray-50 border-gray-200"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 flex-1">
                                                        {isEditing ? (
                                                            <>
                                                                {/* Order Input */}
                                                                <Input
                                                                    type="text"
                                                                    value={inlineEdit.order}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === "") {
                                                                            setInlineAssessmentEdits({ ...inlineAssessmentEdits, [originalIndex]: { ...inlineEdit, order: "" } });
                                                                            return;
                                                                        }
                                                                        const intValue = parseInt(value, 10);
                                                                        if (!isNaN(intValue) && intValue > 0 && String(intValue) === value.trim()) {
                                                                            setInlineAssessmentEdits({ ...inlineAssessmentEdits, [originalIndex]: { ...inlineEdit, order: intValue } });
                                                                        }
                                                                    }}
                                                                    className="w-16"
                                                                    placeholder="Order"
                                                                />
                                                                {/* Type Input */}
                                                                <Input
                                                                    type="text"
                                                                    value={inlineEdit.type}
                                                                    onChange={(e) => setInlineAssessmentEdits({ ...inlineAssessmentEdits, [originalIndex]: { ...inlineEdit, type: e.target.value } })}
                                                                    className="flex-1"
                                                                    placeholder="Type"
                                                                />
                                                                {/* Percentage Input */}
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={inlineEdit.percentage}
                                                                    onChange={(e) => setInlineAssessmentEdits({ ...inlineAssessmentEdits, [originalIndex]: { ...inlineEdit, percentage: e.target.value } })}
                                                                    className="w-24"
                                                                    placeholder="%"
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm font-semibold text-gray-500 min-w-[2rem]">
                                                                    #{entry?.order || "—"}
                                                                </span>
                                                                <span className="text-gray-700 font-medium">
                                                                    {entry?.type || ""}: {entry?.percentage || 0}%
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => updateAssessmentEntry(originalIndex, inlineEdit)}
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

                        {/* Form-level validation */}
                        <FormField
                            control={form.control}
                            name="subjects"
                            render={() => (
                                <FormItem>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200 mt-6">
                            {/* Submit Button Container */}
                            <div className="flex justify-center">
                                <LoadingButton
                                    type="submit"
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