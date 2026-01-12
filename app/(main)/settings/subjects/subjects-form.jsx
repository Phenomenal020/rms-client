"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Plus, X, Trash2, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { updateSubjects } from "@/app/api/subjects/subject-actions";

// Schema for a subject entry
const subjectSchema = z.object({
    id: z.string().optional(),  // on creation, prisma will generate a uuid for the subject. Subsequently, it will be used to render/update the subject.
    name: z.string().trim().min(1, { message: "Subject name is required" }),
});

// Schema for the subjects form - an array of subject entries
const subjectsFormSchema = z.object({
    subjects: z.array(subjectSchema).min(1, { message: "At least one subject is required" }),
});

// Subjects form component - handles subjects section only
export function SubjectsForm({ subjects }) {

    // router - to refresh the page after updating subjects
    const router = useRouter();

    // new subject name
    const [newSubjectName, setNewSubjectName] = useState("");

    // current subject entry (for editing a subject)
    const [currentSubjectEntry, setCurrentSubjectEntry] = useState({
        id: null,
        name: "",
    });

    // editing subject index (likewise)
    const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);

    // form instance
    const form = useForm({
        resolver: zodResolver(subjectsFormSchema),
        defaultValues: {
            subjects: subjects ? subjects.map((subject) => ({
                id: subject?.id || undefined,  // use the id from the db or use undefined for the first time when no subjects exist yet in the db
                name: subject?.name || "",  // likewise for the name
            })) : [],
        },
    });

    // react hook form helpers for dynamic arrays - subjects
    // subjectFields: To render the subjects === Read
    // _appendSubject: To add a new subject === Create
    // _removeSubject: To remove a subject === Delete
    // updateSubject: To update a subject === Update
    const { fields: subjectFields, append: _appendSubject, remove: _removeSubject, update: _updateSubject } = useFieldArray({
        control: form.control,
        name: "subjects",
        keyName: 'tempId'  // to avoid overwriting the id (from prisma) with the frontend id during update
    });

    // Add subject: adding a subject for the first time (on click of the add subject button (+). It is equal to the _appendSubject function + validation checks.
    const addSubject = () => {
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

        // Otherwise, add the subject to the subjects form (no id at this point)
        _appendSubject({
            name: newSubjectName.trim(),
        });

        // show a success toast message
        toast.success(`Subject "${newSubjectName.trim()}" added successfully!`);
        setNewSubjectName(""); // clear the new subject field
    };

    // Edit mode for subjects: on click of the edit icon (pencil). This would render the subject in edit mode allowing the user to update the subject name. 
    const editSubject = (index) => {
        // Validate index (check for null/undefined, not falsy, since 0 is a valid index)
        if (index === null || index === undefined || index < 0 || index >= subjectFields.length) {
            toast.error("Invalid subject entry");
            return;
        }

        // get the subject to edit from the subjects form
        const subjectToEdit = form.getValues(`subjects.${index}`);

        // if the subject to edit exists, set the current subject to the subject to edit
        if (subjectToEdit) {
            setCurrentSubjectEntry({
                id: subjectToEdit.id,
                name: subjectToEdit.name,
            });
            // set the editing subject index to the index of the subject entry to edit
            setEditingSubjectIndex(index);
        } else {
            toast.error("Subject not found");
        }
    };

    // Add/Update subject entry (in edit mode). It is equal to the _updateSubject function + validation checks.
    const updateSubject = () => {
        if (editingSubjectIndex === null) {
            toast.error("No subject selected for edit");
            return;
        }

        // get the subject name from the current subject entry
        const { name } = currentSubjectEntry;

        // if the subject name is valid, update the subject entry
        if (name.trim()) {
            // get a list of all existing subject names
            const existingSubjectNames = form
                .getValues("subjects")
                .map((s) => s.name.toLowerCase());

            // get other subject names by excluding the current subject name
            const otherSubjects = existingSubjectNames.filter((_, i) => i !== editingSubjectIndex)

            // if the subject name already exists, show a toast messageJ
            if (otherSubjects.includes(name.trim().toLowerCase())) {
                toast.error(`Subject "${name.trim()}" already exists!`);
                return;
            }

            // at this point, the updated subject name doesn't exist in the form, so update the subject the existing one marked for update with the new name
            const subjectId = form.getValues(`subjects.${editingSubjectIndex}.id`) || undefined; // DB id if present, else undefined 
            _updateSubject(editingSubjectIndex, {
                id: subjectId,
                name: name.trim(),
            });
            form.trigger("subjects"); // Trigger re-validation
            setEditingSubjectIndex(null);

            // Clear the current entry
            setCurrentSubjectEntry({ id: null, name: "" });
        } else {
            toast.error("Subject name is required");
        }
    };

    // Cancel edit mode for subjects
    const cancelEditSubject = () => {
        // clear the current subject entry
        setCurrentSubjectEntry({ id: null, name: "" });
        // clear the editing subject index
        setEditingSubjectIndex(null);
    };

    // Remove subject entry. It is equal to the _removeSubject function + validation checks.
    const removeSubjectEntry = (index) => {
        _removeSubject(index);  // remove that subject from the subjects form
        form.trigger("subjects"); // Trigger re-validation
        // If we're editing this entry when we remove it, cancel edit mode
        if (editingSubjectIndex === index) {
            cancelEditSubject();
        }
        // show a success toast message
        toast.success(`Subject "${subjectFields[index]?.name}" removed successfully!`);
    };

    // on submit function - update subjects
    async function onSubmit(data) {
        try {
            // Call server action to update subjects
            const result = await updateSubjects(data.subjects);
            console.log(result.error);

            // Check if the request was successful
            if (result.error) {
                toast.error("Failed to update subjects", {
                    description: "Please review the form details and try again",
                });
                return;
            }

            // Success!
            toast.success("Subjects updated successfully");
            router.refresh();
        } catch (err) {
            toast.error("Failed to update subjects", {
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
                        {/* Subject Section */}
                        <div className="space-y-4 mt-8">

                            {/* New Subject Section Header */}
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
                                    <Button type="button" onClick={addSubject} className="w-full cursor-pointer">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Subject
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Subjects List Section - shown only if there are subjects */}
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
                                                key={subjectField.tempId}
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
                                                    {/* if editing, show a ✓ and X icon */}
                                                    {editingSubjectIndex === subjectIndex ? (
                                                        <>
                                                            {/* Save Subject Button when field === editing field*/}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={updateSubject}
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
                                                            {/* Else, show the edit(pencil) and remove(trash) icons when field !== editing field*/}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => editSubject(subjectIndex)}
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
                                    disabled={loading || editingSubjectIndex !== null || !form.formState.isDirty}
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