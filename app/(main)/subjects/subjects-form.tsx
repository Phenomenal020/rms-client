"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { AddSubjectModal } from "./add-subject-modal";
import { EditSubjectModal } from "./edit-subject-modal";
import SmallTermText from "@/shared-components/small-term-text";

// Zod Schema for adding a subject
const addSubjectSchema = z.object({
  subjectName: z.string().trim().min(1, { message: "Subject name is required" }),
  department: z.enum(["none", "commerce", "science", "arts", "general"]),
});
export type AddSubjectValues = z.infer<typeof addSubjectSchema>;

// Department options (enum)
const DEPARTMENT_OPTIONS: AddSubjectValues["department"][] = [
  "none",
  "commerce",
  "science",
  "arts",
  "general",
];

// Placeholder subjects
const placeholderSubjects: AddSubjectValues[] = [
  { subjectName: "Mathematics", department: "science" },
  { subjectName: "Economics", department: "commerce" },
  { subjectName: "English Language", department: "general" },
];

export function SubjectsForm() {
  // subjects state to store the subjects
  const [subjects, setSubjects] = useState<AddSubjectValues[]>(placeholderSubjects);
  // searchQuery state to store the search query
  const [searchQuery, setSearchQuery] = useState("");

  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Add form
  const addForm = useForm<AddSubjectValues>({
    resolver: zodResolver(addSubjectSchema),
    defaultValues: { subjectName: "", department: "none" },
  });

  // Edit form
  const editForm = useForm<AddSubjectValues>({
    resolver: zodResolver(addSubjectSchema),
    defaultValues: { subjectName: "", department: "none" },
  });

  // filteredSubjects to filter the subjects based on the search query
  const filteredSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return subjects;
    return subjects.filter((entry) => {
      return (
        entry.subjectName.toLowerCase().includes(query) ||
        entry.department.toLowerCase().includes(query)
      );
    });
  }, [subjects, searchQuery]);

  // Open add subject dialog
  const openAddSubjectDialog = () => {
    addForm.reset({ subjectName: "", department: "none" });
    setIsAddDialogOpen(true);
  };

  // Open edit subject dialog
  const openEditSubjectDialog = (index: number) => {
    setEditingIndex(index);
    editForm.reset(subjects[index]);
    setIsEditDialogOpen(true);
  };

  // Add a subject
  async function addSubject(values: AddSubjectValues) {
    const subjectName = values.subjectName.trim();
    const exists = subjects.some(
      (entry) => entry.subjectName.toLowerCase() === subjectName.toLowerCase()
    );
    if (exists) {
      addForm.setError("subjectName", { message: `Subject "${subjectName}" already exists` });
      return;
    }
    setSubjects((prev) => [...prev, { subjectName, department: values.department }]);
    setIsAddDialogOpen(false);
    addForm.reset({ subjectName: "", department: "none" });
    toast.success(`Subject "${subjectName}" added successfully`);
  }

  // Update a subject
  function updateSubject(values: AddSubjectValues) {
    if (editingIndex === null) {
      toast.error("No subject selected to update");
      return;
    }
    const subjectName = values.subjectName.trim();
    // Duplicate check — exclude the entry being edited
    const exists = subjects.some(
      (entry, i) =>
        i !== editingIndex &&
        entry.subjectName.toLowerCase() === subjectName.toLowerCase()
    );
    if (exists) {
      editForm.setError("subjectName", { message: `Subject "${subjectName}" already exists` });
      return;
    }
    setSubjects((prev) =>
      prev.map((s, i) => (i === editingIndex ? { subjectName, department: values.department } : s))
    );
    setIsEditDialogOpen(false);
    setEditingIndex(null);
    toast.success(`Subject "${subjectName}" updated successfully`);
  }

  const loading = addForm.formState.isSubmitting;

  return (
    <>
      {/* Page Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h1>
          <SmallTermText />
        </div>
      </section>

      {/* Add Subject Modal */}
      <AddSubjectModal
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        form={addForm}
        onSubmit={addSubject}
        loading={loading}
        departmentOptions={DEPARTMENT_OPTIONS}
      />

      {/* Edit Subject Modal */}
      <EditSubjectModal
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        form={editForm}
        onSubmit={updateSubject}
        loading={editForm.formState.isSubmitting}
        departmentOptions={DEPARTMENT_OPTIONS}
      />

      {/* The subject table */}
      <Card className="border shadow-md">
        <CardContent className="space-y-4">
          <section className="overflow-hidden rounded-sm bg-card">
            {/* The subject header: All Subjects, search and add subject button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h4 className="text-base md:text-lg font-semibold text-foreground">
                All Subjects ({subjects.length})
              </h4>

              <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                {/* Search input */}
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search..."
                  className="h-10 md:h-12 w-full sm:max-w-xs"
                  disabled={loading || subjects.length === 0}
                />
                {/* Add subject button */}
                <Button
                  type="button"
                  onClick={openAddSubjectDialog}
                  className="cursor-pointer whitespace-nowrap h-10 md:h-12"
                >
                  <Plus className="h-3 w-3" />
                  Add Subject
                </Button>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-4" />

            {/* If there are no subjects, show a message */}
            {subjects.length === 0 ? (
              <div>
                <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                  <p className="text-base font-medium text-muted-foreground">No Subject yet</p>
                </div>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No subjects match your search.
              </div>
            ) : (
              <div className="overflow-x-auto py-4">
                <table className="min-w-[300px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                  <colgroup>
                    <col className="w-[10%]" />
                    <col className="w-[45%]" />
                    <col className="w-[25%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="py-2 text-left font-semibold text-muted-foreground">S/N</th>
                      <th className="py-2 text-left font-semibold text-muted-foreground">Subject</th>
                      <th className="py-2 text-left font-semibold text-muted-foreground">Department</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.map((entry, index) => (
                      <tr
                        key={`${entry.subjectName}-${index}`}
                        className="border-b border-border last:border-b-0 hover:bg-muted/40"
                      >
                        {/* S/N */}
                        <td className="py-2 font-medium text-foreground">{index + 1}</td>
                        {/* Subject */}
                        <td className="py-2 text-foreground">
                          <span className="block truncate font-medium text-sm md:text-base pr-2">{entry.subjectName}</span>
                        </td>
                        {/* Department */}
                        <td className="py-2 text-foreground">
                          <span className="block truncate text-muted-foreground capitalize text-sm md:text-base">
                            {entry.department}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="py-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditSubjectDialog(index)}
                              className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm md:text-base"
                            >
                              <Pencil className="h-3 w-3" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </>
  );
}
