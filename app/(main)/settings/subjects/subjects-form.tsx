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
import { useUpsertSubjects, getErrorMessage } from "@/fetcher/mutations";
import type { UpsertSubjectsPayload } from "@/types/subjects";

// Schema for a subject entry
const subjectSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, { message: "Subject name is required" }),
});

// Schema for the subjects form - an array of subject entries
const subjectsFormSchema = z.object({
    subjects: z.array(subjectSchema).min(1, { message: "At least one subject is required" }),
});

// Type for form values
type SubjectsFormValues = z.infer<typeof subjectsFormSchema>;

// Props interface for SubjectsForm
interface SubjectsFormProps {
    subjects: Array<{ id: string | undefined; name: string }> | null | undefined;  // first time, subjects will be null
}

// Subjects form component - handles subjects section only
export function SubjectsForm({ subjects }: SubjectsFormProps) {

    // router - to refresh the page after updating subjects
    const router = useRouter();

    // new subject name
    const [newSubjectName, setNewSubjectName] = useState("");

    const { upsertSubjects, isMutating, error, data } = useUpsertSubjects();


    // current subject entry (for editing a subject)
    const [currentSubjectEntry, setCurrentSubjectEntry] = useState<{ id: string | undefined; name: string }>({
        id: undefined,
        name: "",
    });

    // editing subject index (likewise)
    const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null);

    // form instance
    const form = useForm<SubjectsFormValues>({
        resolver: zodResolver(subjectsFormSchema),
        defaultValues: {
            subjects: subjects ? subjects.map((subject) => ({
                id: subject?.id || undefined, // use the id from the db or use undefined for the first time when no subjects exist yet in the db
                name: subject?.name,  // likewise for the name
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
            id: undefined,    // backend uses this to identify if the payload is create or update
            name: newSubjectName.trim(),
        });

        // show a success toast message
        toast.success(`Subject "${newSubjectName.trim()}" successfully added and ready to be saved!`);
        setNewSubjectName(""); // clear the new subject field
    };

    // Edit mode for subjects: on click of the edit icon (pencil). This would render the subject in edit mode allowing the user to update the subject name. 
    const editSubject = (index: number) => {
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
                id: subjectToEdit?.id,  // May be undefined when editing a subject that has not been saved to the db
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

            // at this point, the updated subject name doesn't exist in the form, so update the existing subject with the new name
            const subjectId = form.getValues(`subjects.${editingSubjectIndex}.id`);
            _updateSubject(editingSubjectIndex, {
                id: subjectId || undefined,  // May be undefined when editing a subject that has not been saved to the db
                name: name.trim(),
            });
            form.trigger("subjects"); // Trigger re-validation
            setEditingSubjectIndex(null);

            // Clear the current entry
            setCurrentSubjectEntry({ id: undefined, name: "" });
        } else {
            toast.error("Subject name is required");
        }
    };

    // Cancel edit mode for subjects
    const cancelEditSubject = () => {
        // clear the current subject entry
        setCurrentSubjectEntry({ id: undefined, name: "" });
        // clear the editing subject index
        setEditingSubjectIndex(null);
    };

    // Remove subject entry. It is equal to the _removeSubject function + validation checks.
    const removeSubjectEntry = (index: number) => {
        _removeSubject(index);  // remove that subject from the subjects form
        form.trigger("subjects"); // Trigger re-validation
        // If we're editing this entry when we remove it, cancel edit mode
        if (editingSubjectIndex === index) {
            cancelEditSubject();
        }
        // show a success toast message
        toast.success(`Subject "${subjectFields[index]?.name}" successfully removed and ready to be saved!`);
    };

    // Strategy: Always send the entire subjects array to the server. The server will then handle the creation, update, and deletion of subjects.
    // on submit function - update subjects
    async function onSubmit(data: SubjectsFormValues) {
        const { subjects } = data;
        try {
            // Call server action to update subjects
            await upsertSubjects(subjects as UpsertSubjectsPayload);

            // Success!
            toast.success("Subjects updated successfully");
            router.refresh();
        }
        catch (err: any) {
            toast.error("Failed to update subjects", {
                description: getErrorMessage(err),
            });
        }
    }

    // loading state for the submit button
    const loading = form.formState.isSubmitting;

    if (subjects) {
        return (
            <Card className="border shadow-md">
                <CardContent className="pt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Subject Section */}
                            <div className="space-y-4">

                                {/* Add New Subject Section subheading (h3) */}
                                <div className="pb-2 border-b border-border">
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">Add New Subject</h3>
                                </div>

                                {/* Add Custom Subject Form */}
                                <div className="flex flex-col sm:flex-row gap-4 items-end">
                                    <div className="space-y-2 flex-1 w-full">
                                        <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">Subject Name</FormLabel>
                                        <Input
                                            placeholder="e.g., Advanced Mathematics, Creative Writing"
                                            value={newSubjectName}
                                            onChange={(e) => setNewSubjectName(e.target.value)}
                                            className="h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
                                        />
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        <Button type="button" onClick={addSubject} className="w-full sm:w-auto h-10 md:h-14 text-sm md:text-base cursor-pointer">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Subject
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Subjects List Section - shown only if there are subjects */}
                            {subjectFields.length > 0 && (
                                <div className="space-y-4 mt-4 pt-4 border-t border-border">

                                    {/* Subjects Section subheading (h3) */}
                                    <div className="pb-2 border-b border-border">
                                        <h3 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">Subjects</h3>
                                    </div>

                                    {/* For each subject */}
                                    <div className="space-y-2">
                                        {subjectFields.map((subjectField, subjectIndex) => {
                                            const subject = form.getValues(`subjects.${subjectIndex}`);

                                            // return  Name, Edit icon, Remove icon 
                                            return (
                                                <div
                                                    key={subjectField.tempId}
                                                    className={`flex items-center justify-between p-3 md:p-4 rounded-md border text-sm md:text-base ${editingSubjectIndex === subjectIndex
                                                        ? "bg-primary/10 border-primary/30"
                                                        : "bg-muted border-border"
                                                        }`}
                                                >

                                                    {/* Subject Name */}
                                                    {/* If editing, show the input field */}
                                                    {editingSubjectIndex === subjectIndex ? (
                                                        <Input
                                                            type="text"
                                                            value={currentSubjectEntry.name}
                                                            onChange={(e) => setCurrentSubjectEntry({ ...currentSubjectEntry, name: e.target.value })}
                                                            className="flex-1 mr-2 h-10 md:h-14 text-sm md:text-base bg-background"
                                                            placeholder="Subject name"
                                                        />
                                                    ) : (
                                                        // Otherwise, show the subject name
                                                        <span className="text-foreground font-medium">
                                                            {subject?.name || "Unnamed Subject"}
                                                        </span>
                                                    )}

                                                    {/* Edit and Remove icons */}
                                                    <div className="flex items-center">
                                                        {/* if editing, show a ✓ and X icon */}
                                                        {editingSubjectIndex === subjectIndex ? (
                                                            <>
                                                                {/* Save Subject Button when field === editing field*/}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={updateSubject}
                                                                    className="h-8 md:h-10 text-sm md:text-base text-primary hover:text-primary/80"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </Button>
                                                                {/* Cancel Edit Subject Button when field === editing field*/}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={cancelEditSubject}
                                                                    className="h-8 md:h-10 text-sm md:text-base text-muted-foreground hover:text-foreground"
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
                                                                    className="h-8 md:h-10 text-sm md:text-base text-primary hover:text-primary/80"
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
                                                                    className="h-8 md:h-10 text-sm md:text-base text-destructive hover:text-destructive/80"
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

                            {/* Submit / Discard Buttons */}
                            <div className="pt-4 md:pt-6 border-t border-border mt-4 md:mt-6">
                                <div className="flex justify-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={!form.formState.isDirty || loading}
                                        onClick={() => { form.reset(); setEditingSubjectIndex(null); setNewSubjectName(""); }}
                                        className="w-max h-10 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                                    >
                                        Discard Changes
                                    </Button>
                                    <LoadingButton
                                        type="submit"
                                        loading={loading}
                                        disabled={loading || editingSubjectIndex !== null || !form.formState.isDirty}
                                        className="w-max h-10 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
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
}