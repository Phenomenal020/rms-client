"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { useSWRConfig } from "swr";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { AddSubjectModal } from "./add-subject-modal";
import { EditSubjectModal } from "./edit-subject-modal";
import { SubjectsLoadingTable } from "./subjects-loading-table";
import SmallTermText from "@/shared-components/small-term-text";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { ErrorBanner } from "@/shared-components/error-banner";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";
import { getApiErrorMessage, getHttpStatus, useCreateSubject, useUpdateSubject, useDeleteSubject } from "@/fetcher/mutations";
import { getSubjects } from "@/fetcher/queries";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { useUser } from "@/contexts/user-context";
import { singleGetSubjectPayload } from "@/types/subjects";

// Zod Schema for adding a subject (no id required)
const addSubjectSchema = z.object({
  name: z.string().trim().max(128, { message: "Subject name should not be more than 128 characters" }).min(1, { message: "Subject name is required" }),
  department: z.enum(["none", "commerce", "science", "arts", "general"]),
});
export type AddSubjectValues = z.infer<typeof addSubjectSchema>;
// Zod Schema for editing a subject
const editSubjectSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, { message: "Subject name is required" }),
  department: z.enum(["none", "commerce", "science", "arts", "general"]),
});
export type EditSubjectValues = z.infer<typeof editSubjectSchema>;

// Department options (enum)
const DEPARTMENT_OPTIONS: AddSubjectValues["department"][] = [
  "none",
  "general",
  "arts",
  "science",
  "commerce",
];

export function SubjectsForm() {
  // hooks for redirection
  const router = useRouter();
  const pathname = usePathname();
  // manually invalidate the cache
  const { mutate } = useSWRConfig();

  // fetch the user's role (gate orgadmin)
  const { user } = useUser();
  const canManage = user?.role === "orgadmin" && user?.twoFactorEnabled === true;

  // Fetcher hooks
  const { data: subjects, isLoading: isLoadingSubjects, error: subjectsError, isValidating: isValidatingSubjects } = getSubjects();
  const subjectList = (subjects ?? []) as singleGetSubjectPayload[];

  // Mutation hooks (errors handled in try-catch block)
  const { trigger: createSubject, isMutating: isCreatingSubject } = useCreateSubject();
  const { trigger: updateSubject, isMutating: isUpdatingSubject } = useUpdateSubject();
  const { trigger: deleteSubject, isMutating: isDeletingSubject } = useDeleteSubject();

  // searchQuery state to store the search query
  const [searchQuery, setSearchQuery] = useState("");
  // Add and edit dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Subject pending delete confirmation
  const [subjectToDelete, setSubjectToDelete] = useState<singleGetSubjectPayload | null>(null);

  // Add form: schema and default values
  const addForm = useForm<AddSubjectValues>({
    resolver: zodResolver(addSubjectSchema),
    defaultValues: { name: "", department: "none" },
  });
  // Edit form: schema and default values
  const editForm = useForm<EditSubjectValues>({
    resolver: zodResolver(editSubjectSchema),
    defaultValues: { id: "", name: "", department: "none" },
  });

  // loading and error state
  const loadError = subjectsError;
  const showSubjectCount = !subjectsError && subjects !== undefined;
  const isComponentLoading = isLoadingSubjects;

  // retry all fetches
  function retryAllFetches() {
    void mutate("/api/v1/subjects");
  }

  // handle authentication redirects based on the error status code
  useEffect(() => {
    if (!subjectsError) return;
    const status = getHttpStatus(subjectsError);
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [subjectsError, router, pathname]);

  // filteredSubjects to filter the subjects based on the search query
  const filteredSubjects = useMemo(() => {
    // get the normalised search query and trim it
    const query = searchQuery.trim().toLowerCase();
    // if there is no query, return all subjects
    if (!query) return subjectList;
    // otherwise, filter the subjects based on the search query
    return subjectList.filter((entry) => {
      // check if the subject name or department includes the query
      return (
        entry.name.toLowerCase().includes(query) ||
        entry.department.toLowerCase().includes(query)
      );
    });
  }, [subjectList, searchQuery]);

  // Open add subject dialog: reset the form and open the add dialog box
  const openAddSubjectDialog = () => {
    if (!canManage) return;   // orgadmin gate
    addForm.reset({ name: "", department: "none" });
    setIsAddDialogOpen(true);
  };

  // Open edit subject dialog: reset the edit form using the selected subject, then open the edit dialog box
  const openEditSubjectDialog = (subject: singleGetSubjectPayload) => {
    if (!canManage) return;   // orgadmin gate
    if (!subjectList.some((entry) => entry.id === subject.id)) return;
    editForm.reset({
      id: subject.id,
      name: subject.name,
      department: subject.department as EditSubjectValues["department"],
    });
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation for the selected subject
  const openDeleteSubjectDialog = (subject: singleGetSubjectPayload) => {
    if (!canManage) return;
    setSubjectToDelete(subject);
  };

  // Add a subject
  async function addSubjectHandler(values: AddSubjectValues) {
    if (!canManage) return;   // orgadmin gate
    // check if the subject already exists in the local variable first before calling the api
    const subjectName = values.name.trim();
    const exists = subjectList.some(
      (entry) => entry.name.toLowerCase() === subjectName.toLowerCase()
    );
    // if it does, set an error and return
    if (exists) {
      toast.error(`Subject "${subjectName}" already exists`);
      return;
    }
    // otherwise, trigger the create subject mutation
    try {
      await createSubject({
        name: values.name,
        department: values.department,
      });
      // SWR onSuccess handler in useCreateSubject invalidates the cache and
      // triggers a refetch, so no need to manually push to subjects state here
      setIsAddDialogOpen(false);
      addForm.reset({ name: "", department: "none" });
      toast.success(`Subject "${subjectName}" added successfully`);
    } catch (error) {
      // if the error is not 401 or 403, show the error toast
      if (!handleAuthRedirect(error, { router, pathname })) {
        toast.error(getApiErrorMessage(error, "Failed to add subject. Please try again."));
      }
    }
  }

  // Update a subject
  async function updateSubjectHandler(values: EditSubjectValues) {
    if (!canManage) return;   // orgadmin gate
    const subjectName = values.name.trim();
    // Duplicate check — exclude the entry being edited
    const exists = subjectList.some(
      (entry) =>
        entry.id !== values.id &&
        entry.name.toLowerCase() === subjectName.toLowerCase()
    );
    if (exists) {
      toast.error(`Subject "${subjectName}" already exists`);
      return;
    }
    // trigger the update subject mutation
    try {
      const updatePayload = {
        id: values.id,
        name: values.name,
        department: values.department,
      }
      await updateSubject(updatePayload);
      // SWR onSuccess handler in useUpdateSubject invalidates the cache and
      // triggers a refetch, so no need to manually patch subjects state here
      setIsEditDialogOpen(false);
      toast.success(`Subject "${subjectName}" updated successfully`);
    } catch (error) {
      // if the error is not 401 or 403, show the error toast
      if (!handleAuthRedirect(error, { router, pathname })) {
        toast.error(getApiErrorMessage(error, "Failed to update subject. Please try again."));
      }
    }
  }

  // Delete a subject (after ConfirmDialog confirm)
  async function deleteSubjectHandler() {
    if (!canManage || !subjectToDelete) return;
    const subjectName = subjectToDelete.name;
    try {
      await deleteSubject({ id: subjectToDelete.id });
      setSubjectToDelete(null);
      toast.success(`Subject "${subjectName}" deleted successfully`);
    } catch (error) {
      if (!handleAuthRedirect(error, { router, pathname })) {
        toast.error(getApiErrorMessage(error, "Failed to delete subject. Please try again."));
      }
    }
  }

  // modal / mutation loading states
  const addLoading = addForm.formState.isSubmitting || isCreatingSubject;
  const editLoading = editForm.formState.isSubmitting || isUpdatingSubject;
  const deleteLoading = isDeletingSubject;
  const isMutating = addLoading || editLoading || deleteLoading;
  // background revalidation after mutate — keep search/add disabled while refreshing
  const isRefreshing = isValidatingSubjects

  return (
    <>
      {/* Page Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h1>
          <SmallTermText />
        </div>
      </section>

      {/* Security setup modal — shown once if 2FA is not yet enabled */}
      <SecuritySetupModal />

      {/* Add Subject Modal */}
      <AddSubjectModal
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        addForm={addForm}
        onSubmit={addSubjectHandler}
        loading={addLoading}
        readOnly={!canManage}
        departmentOptions={DEPARTMENT_OPTIONS}
      />

      {/* Edit Subject Modal */}
      <EditSubjectModal
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editForm={editForm}
        onSubmit={updateSubjectHandler}
        loading={editLoading}
        readOnly={!canManage}
        departmentOptions={DEPARTMENT_OPTIONS}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={subjectToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) setSubjectToDelete(null);
        }}
        title="Delete subject?"
        description={
          subjectToDelete
            ? `Delete "${subjectToDelete.name}"? This cannot be undone. Subjects assigned to classes cannot be deleted until those assignments are removed.`
            : "Delete this subject? This cannot be undone."
        }
        confirmLabel="Delete Subject"
        loading={deleteLoading}
        disabled={!subjectToDelete}
        onConfirm={deleteSubjectHandler}
      />

      {/* The subject table */}
      <Card className="border shadow-md">
        <CardContent className="space-y-4">
          <section className="overflow-hidden rounded-sm bg-card">
            {/* The subject header: All Subjects, search and add subject button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h4 className="text-base md:text-lg font-semibold text-foreground">
                All Subjects{showSubjectCount ? ` (${subjectList.length})` : ""}
              </h4>

              <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                {/* Search input */}
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search..."
                  className="h-10 md:h-12 w-full sm:max-w-xs"
                  disabled={isMutating || isComponentLoading || isRefreshing}
                />
                {/* Add subject button */}
                {canManage && (
                  <Button
                    type="button"
                    onClick={openAddSubjectDialog}
                    className="cursor-pointer whitespace-nowrap h-10 md:h-12 w-[40%] sm:w-auto"
                    disabled={isMutating || isComponentLoading || isRefreshing || loadError !== null}
                  >
                    Add Subject
                  </Button>
                )}
              </div>
            </div>

            {/* Divider */}
            <hr className="my-4" />

            {/* Body: Error banner, loading table, no subjects, no subjects match search, table body */}
            {loadError ? (
              <ErrorBanner
                title="Could not load subjects"
                message={getApiErrorMessage(loadError, "Failed to load subjects. Please try again.")}
                onRetry={retryAllFetches}
              />  // Todo: Change Error Banner
            ) : isComponentLoading ? (
              <SubjectsLoadingTable />  // Loading table AFTER hydration
            ) : subjectList.length === 0 ? (
              /* If there are no subjects, show a message */
              <div>
                <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                  <p className="text-base font-medium text-muted-foreground">
                    No Subjects yet. Please add subjects to continue.
                  </p>
                </div>
              </div>  // Todo: Add Empty State
            ) : filteredSubjects.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No subjects match your search.
              </div>  // No filter match
            ) : (
              <div className="overflow-x-auto py-4">
                <table className="min-w-[300px] w-full table-fixed border-collapse text-sm text-left">
                  <colgroup>
                    <col className="w-[10%]" />
                    <col className="w-[37.5%]" />
                    <col className="w-[37.5%]" />
                    <col className="w-[15%]" />
                  </colgroup>
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="py-2 text-left font-semibold text-muted-foreground">S/N</th>
                      <th className="py-2 text-left font-semibold text-muted-foreground">Subject</th>
                      <th className="py-2 text-left font-semibold text-muted-foreground">Department</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  {/* Table Body */}
                  <tbody>
                    {filteredSubjects.map((entry: singleGetSubjectPayload, index: number) => (
                      <tr
                        key={entry.id}
                        className="border-b border-border last:border-b-0 hover:bg-muted/40"
                      >

                        {/* S/N */}
                        <td className="py-2 font-medium text-foreground">{index + 1}</td>
                        {/* Subject */}
                        <td className="py-2 text-foreground">
                          <span className="block truncate font-medium text-sm lg:text-base pr-2">{entry.name}</span>
                        </td>
                        {/* Department */}
                        <td className="py-2 text-foreground">
                          <span className="block truncate text-muted-foreground capitalize text-sm lg:text-base">
                            {entry.department}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="py-2">
                          {canManage && (
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit button */}
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => openEditSubjectDialog(entry)}
                                disabled={isMutating || isComponentLoading || isRefreshing || loadError !== null}
                                className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm lg:text-base"
                              >
                                <Pencil className="h-3 w-3" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                              {/* Delete button */}
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => openDeleteSubjectDialog(entry)}
                                disabled={isMutating || isComponentLoading || isRefreshing || loadError !== null}
                                className="cursor-pointer border border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300 text-sm lg:text-base"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </div>
                          )}
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
