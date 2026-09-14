"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, BookOpen, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import SmallTermText from "@/shared-components/small-term-text";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { getActiveTerm, getClassById, getOrgMembers, getSubjects } from "@/fetcher/queries";
import { getApiErrorMessage, useSaveSubjectClassAssignment, useUpdateClass } from "@/fetcher/mutations";
import { classKey, SUBJECTS_KEY, ORG_MEMBERS_KEY, ACTIVE_TERM_KEY } from "@/fetcher/keys";
import type { singleGetSubjectPayload } from "@/types/subjects";
import { ClassSubjectsLoadingTable } from "./class-subjects-loading-table";
import { EditClassModal, type EditClassValues } from "../edit-class-modal";
import { useUser } from "@/contexts/user-context";
import { handleAuthRedirect } from "@/utils/auth-redirect";

const UNASSIGNED = "__unassigned__";

// Edit class zod schema (name + form teacher only)
const editClassSchema = z.object({
  name: z.string().trim().max(64, { message: "Class name should not be more than 64 characters" }).min(1, { message: "Class name is required" }),
  formTeacherId: z.string().nullable(),
});

export function ClassSubjectsContent() {
  // For redirection and manual retry
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  // Org admin gate — same rules as the classes list page
  const { user } = useUser();
  const canManage = user?.role === "orgadmin" && user?.twoFactorEnabled === true && user?.emailVerified === true;

  // Extract the class id from the URL
  const { classId } = useParams();
  const resolvedClassId = typeof classId === "string" ? classId : null;

  // Fetch the active term from the api
  const { data: activeTerm, error: activeTermError, isLoading: isLoadingActiveTerm, statusCode: activeTermStatusCode } = getActiveTerm();
  const activeTermId = activeTerm?.id ?? null;

  // Use the active term id to fetch the data for that class: subject class assignments
  const { data: classData, error: classError, isLoading: isLoadingClass, statusCode: classStatusCode } = getClassById(resolvedClassId, activeTermId);
  // Get the subjects for the organisation
  const { data: subjects, error: subjectsError, isLoading: isLoadingSubjects, statusCode: subjectsStatusCode } = getSubjects();
  // Get the teachers for the organisation
  const { teachers = [], error: teachersError, statusCode: teachersStatusCode, isLoading: isLoadingTeachers } = getOrgMembers();

  // Mutation hook to save one subject-class assignment at a time
  const { trigger: saveAssignment, isMutating: isSaving } = useSaveSubjectClassAssignment();
  // Mutation hook to update class name / form teacher
  const { trigger: updateClass, isMutating: isUpdatingClass, error: updateClassError } = useUpdateClass();

  // Edit class dialog state and form
  const [isEditOpen, setIsEditOpen] = useState(false);
  const editForm = useForm<EditClassValues>({
    resolver: zodResolver(editClassSchema),
    defaultValues: { name: "", formTeacherId: "" },
  });

  // Local teacher picks per subject (select first, assign button saves)
  const [selections, setSelections] = useState<Record<string, string>>({});
  // Track which subject row is currently saving
  const [savingSubjectId, setSavingSubjectId] = useState<string | null>(null);

  // Sync local selections from saved assignments when class data loads or refreshes
  useEffect(() => {
    if (!classData?.subjectAssignments) return;
    const next: Record<string, string> = {};
    for (const row of classData.subjectAssignments) {
      next[row.subjectId] = row.assignedTeacher?.id ?? UNASSIGNED;
    }
    setSelections(next);
  }, [classData?.subjectAssignments]);

  // Track loading and error states
  const loadError = activeTermError ?? classError ?? subjectsError ?? teachersError;
  const isLoading = isLoadingActiveTerm || isLoadingClass || isLoadingSubjects || isLoadingTeachers;
  // Track if the class is not found (when none of the fetches are loading, no errors, and the status code is 404)
  const classNotFound = !isLoading && !loadError && classStatusCode === 404;

  // Get the subjects offered by the school
  const subjectList = (subjects ?? []) as singleGetSubjectPayload[];
  // console.log("subjectList", subjectList);

  // Retry the fetches
  const retryFetches = () => {
    void mutate(ACTIVE_TERM_KEY);
    if (resolvedClassId && activeTermId) {
      void mutate(classKey(resolvedClassId, activeTermId));
    }
    void mutate(SUBJECTS_KEY);
    void mutate(ORG_MEMBERS_KEY);
  };

  // Open the edit class modal with current class data
  function openEditDialog() {
    if (!canManage || !classData) return;
    editForm.reset({
      name: classData.name,
      formTeacherId: classData.formTeacher?.id ?? "",
    });
    setIsEditOpen(true);
  }

  // Save updated class name and/or form teacher
  async function handleUpdateClass(values: EditClassValues) {
    if (!canManage || !resolvedClassId || !classData) return;

    const name = values.name.trim();
    const formTeacherId = values.formTeacherId || null;
    const savedName = classData.name.trim();
    const savedFormTeacherId = classData.formTeacher?.id ?? null;

    const payload: { name?: string; formTeacherId?: string | null } = {};
    if (name !== savedName) payload.name = name;
    if (formTeacherId !== savedFormTeacherId) payload.formTeacherId = formTeacherId;

    // Nothing changed — just close
    if (Object.keys(payload).length === 0) {
      setIsEditOpen(false);
      return;
    }

    try {
      const { error } = await updateClass({ id: resolvedClassId, ...payload });
      if (error) throw error;
      setIsEditOpen(false);
      if (activeTermId) {
        void mutate(classKey(resolvedClassId, activeTermId));
      }
      toast.success(`Class "${name}" updated successfully`);
    } catch (err) {
      const mutationErr = updateClassError || err;
      if (!handleAuthRedirect(mutationErr, { router, pathname })) {
        toast.error(getApiErrorMessage(mutationErr, `Failed to update class "${name}"`));
      }
    }
  }

  // Save one subject assignment (one request per row)
  async function handleAssign(subjectId: string) {
    //  If there is no class id or active term id, just return
    if (!resolvedClassId || !activeTermId) return;
    // Get the saved assignment for the subject
    const savedAssignment = classData?.subjectAssignments?.find((assignment) => assignment.subjectId === subjectId);
    // Get the saved teacher id for the subject
    const savedTeacherId = savedAssignment?.assignedTeacher?.id ?? UNASSIGNED;
    // Get the selected teacher id for the subject
    const selected = selections[subjectId] ?? savedTeacherId;
    // Check if the subject has an assignment
    const hasAssignment = Boolean(savedAssignment);

    // Nothing new to save for this row if the selected teacher is the same as the saved teacher
    if (selected === savedTeacherId) return;

    // Require a teacher when creating a new assignment if the selected teacher is not assigned
    if (selected === UNASSIGNED && !hasAssignment) {
      toast.error("Select a teacher to assign.");
      return;
    }

    setSavingSubjectId(subjectId);
    try {
      const {error} = await saveAssignment({
        id: resolvedClassId,
        activeTermId,
        subjectId,
        assignedTeacherId: selected === UNASSIGNED ? null : selected,
      });
      if (error) throw error;
      toast.success(`Subject teacher assigned successfully`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save assignment. Please try again."));
    } finally {
      setSavingSubjectId(null);
    }
  }

  // Handle redirection errors
  useEffect(() => {
    if (!loadError) return;
    const status = [activeTermStatusCode, classStatusCode, subjectsStatusCode, teachersStatusCode].find(
      (code) => code === 401 || code === 403,
    );
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [loadError, activeTermStatusCode, classStatusCode, subjectsStatusCode, teachersStatusCode, router, pathname]);


  if (!resolvedClassId) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <EmptyNoEntry embedded title="Invalid class" description="The class link is invalid." />
        </div>
      </div>
    );
  }

  // Block the page once the active term fetch finished and there is no active term.
  // Assignments are scoped to the active term and the API rejects saves without one.
  if (!isLoadingActiveTerm && !activeTermId) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <EmptyNoEntry
            embedded
            title="No active term"
            description="Activate an academic term before assigning subject teachers."
            actionLabel="Back to classes"
            actionHref="/classes"
          />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background px-4 py-6 md:px-6 md:py-10">
      {/* Edit class modal */}
      <EditClassModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        editForm={editForm}
        onSubmit={handleUpdateClass}
        readOnly={!canManage}
        loading={editForm.formState.isSubmitting || isUpdatingClass}
        teacherOptions={teachers}
      />

      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="space-y-3">
          {/* Back to classes button */}
          <Button variant="ghost" size="sm" asChild className="h-9 px-2 -ml-2">
            <Link href="/classes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to classes
            </Link>
          </Button>

          {/* Class name, form teacher, and edit action */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {classData?.name ?? "Class subjects"}
              </h1>
              <SmallTermText />
              {classData?.formTeacher?.name ? (
                <p className="text-sm text-muted-foreground">
                  Class teacher: {classData.formTeacher.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No class teacher assigned</p>
              )}
            </div>
            {canManage && !isLoading && !loadError && !classNotFound ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={isSaving || isUpdatingClass}
                onClick={openEditDialog}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit class
              </Button>
            ) : null}
          </div>
        </section>

        {/* Subject teacher assignments */}
        <Card className="border shadow-md">
          <CardContent className="p-4 md:p-6">
            {isLoading ? (
              // Show a loading state
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold text-foreground md:text-lg">
                      Subject teacher assignments
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Assign a teacher to each subject for this class and term.
                    </p>
                  </div>
                </div>
                <ClassSubjectsLoadingTable />
              </div>
            ) : classNotFound ? (
              // Show a message if the class is not found
              <EmptyNoEntry
                embedded
                title="Class not found"
                description="This class may have been removed or is not available."
                actionLabel="Back to classes"
                actionHref="/classes"
              />
            ) : loadError ? (
              // Show an error banner if the class data cannot be loaded
              <ErrorBanner
                title="Could not load class subjects"
                message={getApiErrorMessage(loadError, "Failed to load class data. Please try again.")}
                onRetry={retryFetches}
              />
            ) : subjectList.length === 0 ? (
              // Show a message if there are no subjects in the school
              <EmptyNoEntry
                embedded
                title="No subjects in your school"
                description="Add subjects first, then assign teachers to this class."
                actionLabel="Go to subjects"
                actionHref="/subjects"
              />
            ) : (
              // Otherwise, show the subject teacher assignments table
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Subject teacher assignments title and description */}
                  <div>
                    <h2 className="text-base font-semibold text-foreground md:text-lg">
                      Subject teacher assignments
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Assign a teacher to each subject for this class and term.
                    </p>
                  </div>
                  {/* Show the number of subjects */}
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <BookOpen className="h-3 w-3" />
                    {subjectList.length}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="min-w-full text-sm">
                    {/* Header row */}
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Subject</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Subject teacher</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    {/* Body rows */}
                    <tbody>
                      {/* Map through the subjects and create a row for each subject */}
                      {subjectList.map((subject) => {
                        // // Use the subject id of the assignment to find the subjectClass assignment pertaining to that subject
                        const savedAssignment = classData?.subjectAssignments?.find((assignment) => assignment.subjectId === subject.id);
                        // Get the assigned teacher id or use unassigned if null
                        const savedTeacherId = savedAssignment?.assignedTeacher?.id ?? UNASSIGNED;
                        // Check if the subject has an assignment
                        const hasAssignment = Boolean(savedAssignment);
                        // Check if the subject row has unsaved changes
                        const selectedId = selections[subject.id] ?? savedTeacherId;
                        const isDirty = selectedId !== savedTeacherId;
                        // // Check if this row is the one currently saving
                        const rowSaving = savingSubjectId === subject.id;
                        const rowBusy = isSaving;

                        return (
                          <tr key={subject.id} className="border-t border-border">
                            {/* Colummn 1: Subject name */}
                            <td className="px-4 py-3 font-medium text-foreground">{subject.name}</td>
                            {/* Column 2: Assigned teacher if assigned or select teacher dropdown */}
                            <td className="px-4 py-3">
                              {/* Teacher select from teacher dropdown */}
                              <Select
                                // Set the selected teacher for the subject
                                value={selections[subject.id] ?? UNASSIGNED}
                                // Update local selection only — api save happens on Assign/Reassign
                                onValueChange={(value) =>
                                  setSelections((prev) => ({ ...prev, [subject.id]: value }))
                                }
                                disabled={rowBusy}
                              >
                                {/* Selelct trigger is a "select teacher" placeholder */}
                                <SelectTrigger className="w-full min-w-[12rem] max-w-xs">
                                  <SelectValue placeholder="Select teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={UNASSIGNED}>Not assigned</SelectItem>
                                  {/* Teachers list select content */}
                                  {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                      {teacher.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            {/* Action button to assign or reassign the teacher */}
                            <td className="px-4 py-3 text-right">
                              <Button
                                type="button"
                                size="sm"
                                variant={hasAssignment ? "outline" : "default"}
                                className="cursor-pointer"
                                disabled={!isDirty || rowBusy}
                                onClick={() => void handleAssign(subject.id)}
                              >
                                {rowSaving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-label="Saving assignment" />
                                ) : hasAssignment ? (
                                  "Reassign"
                                ) : (
                                  "Assign"
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
