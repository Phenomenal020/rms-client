'use client';

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Edit3, Lock, LockOpen, Save, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { AssessmentStructure } from "@/types/drizzle";
import type { SubjectRecordStudentRow } from "@/fetcher/queries";
import type { SaveSubjectScoresByIdPayload } from "@/types/view";
import { getApiErrorMessage, useLockSubjectAssignment, useSaveSubjectScoresById, useUnlockSubjectAssignment } from "@/fetcher/mutations";
import { Button } from "@/shadcn/ui/button";
import { Form } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { ConfirmDialog } from "@/shared-components/confirm-dialog";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { SubjectResultTable as SubjectResultDataTable, type SubjectScoresFormValues } from "./subject-result-table";

// Props for the SubjectResultTable component
interface SubjectResultTableProps {
  assignmentId: string;
  termId: string;
  isEffectivelyLocked: boolean;
  enrolledStudents: SubjectRecordStudentRow[];
  getGrade: (percentage: number) => string | null;
  getRemark: (grade: string | null) => string | null;
  assessmentStructure: AssessmentStructure[];
  canEdit?: boolean;
  canLockUnlock?: boolean;
  isGlobalEditing?: boolean;
  onGlobalEditingChange?: (isEditing: boolean) => void;
  onRecordRefresh?: () => void;
}

// Helper function to map students to form values
function mapStudentsToFormValues(
  students: SubjectRecordStudentRow[],
  assessmentStructure: AssessmentStructure[],
): SubjectScoresFormValues {
  return {
    students: students.map((student) => ({
      studentId: student.id,
      scores: assessmentStructure.map((structure) => {
        const scoreEntry = student.scores.find(
          (score) => score.assessmentStructureId === structure.id,  // eg, ca score, exam score, etc
        );
        return {
          assessmentScoreId: scoreEntry?.assessmentScoreId ?? null,
          assessmentStructureId: structure.id,
          score: scoreEntry?.score ?? 0,
        };
      }),
    })),
  };
}

// Main component for the subject result table
export function SubjectResultTable({ assignmentId, termId, isEffectivelyLocked, enrolledStudents, getGrade, getRemark, assessmentStructure, canEdit, canLockUnlock, isGlobalEditing, onGlobalEditingChange, onRecordRefresh }: SubjectResultTableProps) {

  // For redirection
  const router = useRouter();
  const pathname = usePathname();

  // State Management
  const [isPending, startTransition] = useTransition();
  const [isScoresLocked, setIsScoresLocked] = useState(isEffectivelyLocked);
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockHours, setUnlockHours] = useState("3");

  // Mutation hooks: unlock assignment, lock assignment, and save scores by assignment and term id
  const { unlockSubjectAssignment, isMutating: isUnlocking } = useUnlockSubjectAssignment();
  const { lockSubjectAssignment, isMutating: isLocking } = useLockSubjectAssignment();
  const { saveSubjectScoresById, isMutating: isSavingScores } = useSaveSubjectScoresById();

  // If this component is locked, disable score editing and global editing (to disable other components from editing)
  useEffect(() => {
    setIsScoresLocked(isEffectivelyLocked);
    if (isEffectivelyLocked) {
      setIsEditingScores(false);
      onGlobalEditingChange?.(false);
    }
  }, [isEffectivelyLocked, onGlobalEditingChange]);

  // If thre are no enrolled students, disable lock and edit controls
  const hasEnrolledStudents = enrolledStudents.length > 0;
  const showLockControls = canLockUnlock && hasEnrolledStudents;
  const showEditControls = canEdit && hasEnrolledStudents;

  // Schema for the form
  const scoreEntrySchema = z.object({
    assessmentScoreId: z.string().nullable(),  // id of the score entry in the database
    assessmentStructureId: z.uuid(),  // id of the assessment structure (eg, ca, exam, etc)
    score: z.number().int().min(0).max(100),  // actual number 
  });

  // Schema for the table
  const tableSchema = z.object({
    students: z.array(  // rows
      z.object({
        studentId: z.string().min(1),
        scores: z.array(scoreEntrySchema).length(assessmentStructure.length),  // columns
      }),
    ),
  });

  // The actual form: shown when editingScores is true
  const form = useForm<SubjectScoresFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: mapStudentsToFormValues(enrolledStudents, assessmentStructure),
  });

  // Anytime the assignment id, enrolled students, or assessment structure changes, reset the form with the new values
  useEffect(() => {
    form.reset(mapStudentsToFormValues(enrolledStudents, assessmentStructure));
  }, [assignmentId, enrolledStudents, assessmentStructure, form]);

  // Watch the students array to update the table
  const watchedStudents = form.watch("students");
  // Validate the unlock hours
  const parsedUnlockHours = Number(unlockHours);
  const unlockHoursValid = Number.isInteger(parsedUnlockHours) && parsedUnlockHours >= 1 && parsedUnlockHours <= 24;

  // Open the unlock dialog
  const openUnlockDialog = (): void => {
    if (!showLockControls || !isScoresLocked) return;
    setUnlockHours("3");
    setUnlockDialogOpen(true);
  };

  // open the lock dialog
  const openLockDialog = (): void => {
    if (!showLockControls || isScoresLocked) return;
    setLockDialogOpen(true);
  };

  // Handle the confirmation of the unlock dialog
  const handleConfirmUnlock = async (): Promise<void> => {
    // If the unlock hours are not valid, do nothing
    if (!unlockHoursValid) return;
    // Try to unlock the scores via api call
    try {
      const { error } = await unlockSubjectAssignment({ assignmentId, termId, unlockHours: parsedUnlockHours });
      // If there is an error, throw the error
      if (error) throw error;
      // If successful, show a success toast
      toast.success(`Scores unlocked for ${parsedUnlockHours} hour(s).`);
      // Close the unlock dialog
      setUnlockDialogOpen(false);
      // Refresh the records
      onRecordRefresh?.();
    } catch (err) {
      // If there is an error, check for redirection and handle accordingly
      if (!handleAuthRedirect(err, { router, pathname })) {
        toast.error("Could not unlock scores", {
          description: getApiErrorMessage(err, "Please try again."),
        });
      }
    }
  };

  // Handle the confirmation of the lock dialog
  const handleConfirmLock = async (): Promise<void> => {
    // Try to lock the scores via api call
    try {
      const { error } = await lockSubjectAssignment({ assignmentId, termId });
      // If there is an error, throw the error
      if (error) throw error;
      // If successful, show a success toast
      toast.success("Scores locked.");
      // Close the lock dialog
      setLockDialogOpen(false);
      setIsScoresLocked(true);
      setIsEditingScores(false);
      onGlobalEditingChange?.(false);
      // Refresh the records
      onRecordRefresh?.();
    } catch (err) {
      // If there is an error, check for redirection and handle accordingly
      if (!handleAuthRedirect(err, { router, pathname })) {
        toast.error("Could not lock scores", {
          description: getApiErrorMessage(err, "Please try again."),
        });
      }
    }
  };

  // Handle the start of editing scores: set isEditingScores to true to trigger the form inputs to be rendered instead of the readonly table
  const handleStartEditing = (): void => {
    if (!showEditControls || isScoresLocked || isGlobalEditing) return;
    // Set the editing state to true
    setIsEditingScores(true);
    onGlobalEditingChange?.(true);
  };

  // Handle the cancellation of editing scores: simply reset to the original values
  const handleCancel = (): void => {
    form.reset(mapStudentsToFormValues(enrolledStudents, assessmentStructure));
    setIsEditingScores(false);
    onGlobalEditingChange?.(false);
  };

  // Build the payload for the save scores by assignment and term id api call ( a list of score objects)
  const buildSavePayload = (data: SubjectScoresFormValues): SaveSubjectScoresByIdPayload => {
    const scores: SaveSubjectScoresByIdPayload["scores"] = [];
    // For each student row
    for (const studentRow of data.students) {
      // For each score row
      for (const scoreRow of studentRow.scores) {
        // If the score id is not null (an update), add the score to the payload with the assessmentScoreId as the primary identifier
        if (scoreRow.assessmentScoreId) {
          scores.push({
            assessmentScoreId: scoreRow.assessmentScoreId,
            score: scoreRow.score,
          });
        } else {
          // If the score id is null (a new score), add the score to the payload with the studentId and assessmentStructureId to be used to construct the score record in the database
          scores.push({
            studentId: studentRow.studentId,
            assessmentStructureId: scoreRow.assessmentStructureId,
            score: scoreRow.score,
          });
        }
      }
    }
    // Return the payload of score objects
    return {
      assignmentId,
      academicTermId: termId,
      scores,
    };
  };


  // Handle the submission of the form: save the scores via api call
  const onSubmit = (data: SubjectScoresFormValues): void => {
    // If the user is not allowed to edit, do nothing
    if (!canEdit) return;
    // Start a transition to save the scores
    startTransition(async () => {
      // Try to save the scores via api call
      try {
        const { error } = await saveSubjectScoresById(buildSavePayload(data));
        // If there is an error, throw the error
        if (error) throw error;
        // If successful, show a success toast
        toast.success("Scores saved successfully");
        // Close the editing state
        setIsEditingScores(false);
        // Disable global editing
        onGlobalEditingChange?.(false);
        toast.success("Scores saved successfully");
      } catch (err) {
        // If there is an error, check for redirection and handle accordingly
        if (!handleAuthRedirect(err, { router, pathname })) {
          toast.error("Failed to save scores", {
            description: getApiErrorMessage(err, "An error occurred while saving scores"),
          });
        }
      }
    });
  };


  // Determine if the table is read only: if the user is not allowed to edit, the scores are locked, or the editing state is false
  const tableReadOnly = !canEdit || isScoresLocked || !isEditingScores;
  // Determine if the component is busy: if the scores are being saved, unlocked, or locked, or the transition is pending
  const isBusy = isPending || isSavingScores || isUnlocking || isLocking;

  return (
    <div className="mb-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            {/* Title */}
            <h3 className="text-base sm:text-lg font-bold text-foreground border-border">
              ACADEMIC PERFORMANCE
            </h3>

            {/* Edit controls */}
            <div className="flex items-center gap-1">
              {(showLockControls || showEditControls) && (
                <>
                  {/*  If the lock controls or edit controls are true, show the lock and edit buttons */}
                  {showLockControls && !isEditingScores && (
                    // Lock controls but not editing? show the lock or unlock buttons only
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 border-border text-foreground hover:bg-muted cursor-pointer"
                      onClick={isScoresLocked ? openUnlockDialog : openLockDialog}
                      disabled={(isGlobalEditing && !isScoresLocked) || isBusy}
                      aria-label={isScoresLocked ? "Unlock scores for editing" : "Lock scores"}
                    >
                      {isScoresLocked ? (
                        <Lock className="size-4" />
                      ) : (
                        <LockOpen className="size-4" />
                      )}
                    </Button>
                  )}

                  {/* Edit controls but not editing? show the lock or unlock buttons only */}
                  {showEditControls && !isEditingScores && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 border-border text-foreground hover:bg-muted cursor-pointer"
                      onClick={handleStartEditing}
                      disabled={isGlobalEditing || isScoresLocked || isBusy}
                      aria-label="Edit scores"
                    >
                      <Edit3 className="size-4" />
                    </Button>
                  )}

                  {/*  If the edit controls are true and the editing state is true, show the save and cancel buttons */}
                  {showEditControls && isEditingScores && (
                    <>
                      {/* Save button */}
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        className="size-8 border-border text-foreground hover:bg-muted cursor-pointer"
                        disabled={isBusy || !form.formState.isDirty}
                        aria-label="Save scores"
                      >
                        <Save className="size-4" />
                      </Button>

                      {/* Cancel button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 border-border text-foreground hover:bg-muted cursor-pointer"
                        onClick={handleCancel}
                        disabled={isBusy}
                        aria-label="Cancel editing"
                      >
                        <X className="size-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* If there are no enrolled students, show the empty no entry component */}
          {enrolledStudents.length === 0 ? (
            <EmptyNoEntry
              embedded
              title="No students enrolled"
              description="No students are enrolled in this subject yet."
              actionLabel="Manage enrollment"
              actionHref="/enrollment"
            />
          ) : (
            // If there are enrolled students, show the subject result data table
            <SubjectResultDataTable
              enrolledStudents={enrolledStudents}
              getGrade={getGrade}
              getRemark={getRemark}
              assessmentStructure={assessmentStructure}
              isEditingScores={isEditingScores}
              readOnly={tableReadOnly}
              control={form.control}
              watchedStudents={watchedStudents}
            />
          )}
        </form>
      </Form>


      {/* Conform Dialog for unlocking scores */}
      <ConfirmDialog
        open={unlockDialogOpen}
        onOpenChange={setUnlockDialogOpen}
        title="Unlock score edits"
        description="Allow the assigned subject teacher to edit scores. Choose how long the unlock window should last."
        confirmLabel="Unlock"
        confirmVariant="default"
        loading={isUnlocking}
        disabled={!unlockHoursValid}
        onConfirm={handleConfirmUnlock}
      >
        {/* Content */}
        <div className="space-y-2 pt-2">
          <Label htmlFor="unlock-hours">Unlock duration (hours)</Label>
          <Input
            id="unlock-hours"
            type="number"
            min={1}
            max={24}
            value={unlockHours}
            onChange={(e) => setUnlockHours(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Minimum 1 hour, maximum 24 hours.</p>
        </div>
      </ConfirmDialog>

      {/* Conform Dialog for locking scores */}
      <ConfirmDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        title="Lock score edits"
        description="Prevent further score edits for this subject assignment?"
        confirmLabel="Lock"
        loading={isLocking}
        onConfirm={handleConfirmLock}
      />
    </div>
  );
}