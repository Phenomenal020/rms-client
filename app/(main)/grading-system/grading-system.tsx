"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
import { useUpsertTerm, getErrorMessage } from "@/fetcher/mutations";
import type { GradingEntry } from "@/types/term";

const gradingSystemSchema = z.object({
  gradingEntry: z
    .array(
      z.object({
        grade: z.string().min(1),
        minScore: z.number().min(0).max(100),
        maxScore: z.number().min(0).max(100),
      })
    )
    .min(1, { message: "At least one grading entry is required" })
    .refine((entries) => {
      return entries.every((entry) => {
        const min = Number(entry.minScore);
        const max = Number(entry.maxScore);
        return !isNaN(min) && !isNaN(max) && min >= 0 && max <= 100 && min <= max;
      });
    }, {
      message: "Scores must be valid numbers between 0-100, and min score must be less than or equal to max score",
      path: ["gradingEntry"],
    })
    .refine((entries) => {
      const ranges = entries
        .map((entry) => ({ min: Number(entry.minScore), max: Number(entry.maxScore) }))
        .filter((range) => !isNaN(range.min) && !isNaN(range.max))
        .sort((a, b) => a.min - b.min);

      if (ranges.length === 0) return false;
      for (let i = 0; i < ranges.length - 1; i++) {
        if (ranges[i].max > ranges[i + 1].min) return false;
      }
      return true;
    }, {
      message: "Grade ranges cannot overlap",
      path: ["gradingEntry"],
    })
    .refine((entries) => {
      const ranges = entries
        .map((entry) => ({ min: Number(entry.minScore), max: Number(entry.maxScore) }))
        .filter((range) => !isNaN(range.min) && !isNaN(range.max))
        .sort((a, b) => a.min - b.min);

      if (ranges.length === 0) return false;

      let currentPos = -1;
      for (const range of ranges) {
        if (range.min !== currentPos + 1) return false;
        currentPos = range.max;
      }
      return currentPos === 100;
    }, {
      message: "Grade ranges must total exactly 100% (0-100) with no gaps",
      path: ["gradingEntry"],
    }),
});

type GradingSystemFormValues = z.infer<typeof gradingSystemSchema>;

interface GradingSystemProps {
  academicTerm: any;
}

export function GradingSystem({ academicTerm }: GradingSystemProps) {
  const router = useRouter();
  const { upsertTerm, isMutating } = useUpsertTerm();

  const initialGradingEntry: GradingEntry = {
    grade: "",
    minScore: "",
    maxScore: "",
  };

  const [currentGradingEntry, setCurrentGradingEntry] = useState<GradingEntry>(initialGradingEntry);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  const defaultValues = useMemo<GradingSystemFormValues>(() => ({
    gradingEntry: (academicTerm?.gradingEntry || []).map((entry: GradingEntry) => ({
      grade: entry.grade,
      minScore: Number(entry.minScore),
      maxScore: Number(entry.maxScore),
    })),
  }), [academicTerm]);

  const form = useForm<GradingSystemFormValues>({
    resolver: zodResolver(gradingSystemSchema),
    defaultValues,
  });

  const addGradingEntry = () => {
    const { grade, minScore, maxScore } = currentGradingEntry;
    if (!grade.trim() || minScore === "" || maxScore === "") return;

    const minScoreNum = Number(minScore);
    const maxScoreNum = Number(maxScore);

    if (minScoreNum < 0) {
      toast.error("Minimum score must be greater than or equal to 0");
      return;
    }
    if (maxScoreNum > 100) {
      toast.error("Maximum score must be less than or equal to 100");
      return;
    }
    if (minScoreNum >= maxScoreNum) {
      toast.error("Maximum score must be greater than minimum score");
      return;
    }

    const currentGrading = form.getValues("gradingEntry") || [];
    const hasOverlap = currentGrading.some((entry, idx) => {
      if (editingIndex !== null && idx === editingIndex) return false;
      const existingMin = Number(entry.minScore);
      const existingMax = Number(entry.maxScore);
      return minScoreNum < existingMax && maxScoreNum > existingMin;
    });

    if (hasOverlap) {
      toast.error("This grade range overlaps with an existing range");
      return;
    }

    if (editingIndex !== null) {
      const updatedGrading = [...currentGrading];
      updatedGrading[editingIndex] = {
        grade: grade.trim(),
        minScore: minScoreNum,
        maxScore: maxScoreNum,
      };
      form.setValue("gradingEntry", updatedGrading);
      setEditingIndex(null);
    } else {
      form.setValue("gradingEntry", [
        ...currentGrading,
        { grade: grade.trim(), minScore: minScoreNum, maxScore: maxScoreNum },
      ]);
    }

    form.trigger("gradingEntry");
    setCurrentGradingEntry(initialGradingEntry);
    setIsEntryDialogOpen(false);
  };

  // Add Grading Entry 
  const editGradingEntry = (index: number) => {
    const allGrades = form.getValues("gradingEntry") || [];
    const entryToEdit = allGrades[index];
    if (!entryToEdit) return;

    setCurrentGradingEntry({
      grade: entryToEdit.grade,
      minScore: String(entryToEdit.minScore ?? ""),
      maxScore: String(entryToEdit.maxScore ?? ""),
    });
    setEditingIndex(index);
    setIsEntryDialogOpen(true);
  };

  // Cancel Grading Entry
  const cancelEdit = () => {
    setCurrentGradingEntry(initialGradingEntry);
    setEditingIndex(null);
    setIsEntryDialogOpen(false);
  };

  // Remove Grading Entry
  const removeGradingEntry = (index: number) => {
    const currentGrading = form.getValues("gradingEntry") || [];
    form.setValue(
      "gradingEntry",
      currentGrading.filter((_, i) => i !== index)
    );
    form.trigger("gradingEntry");

    if (editingIndex === index) {
      cancelEdit();
    }
  };

  async function onSubmit(data: GradingSystemFormValues) {
    if (!academicTerm?.academicYear || !academicTerm?.term || !academicTerm?.class?.name) {
      toast.error("Missing term information", {
        description: "Please complete your term information before updating grading.",
      });
      return;
    }

    try {
      const termData: any = {
        academicYear: academicTerm.academicYear,
        term: academicTerm.term,
        className: academicTerm.class.name,
        gradingEntry: data.gradingEntry.map((entry) => ({
          grade: entry.grade,
          minScore: Number(entry.minScore),
          maxScore: Number(entry.maxScore),
        })),
      };

      if (academicTerm?.termDays !== undefined) termData.termDays = academicTerm.termDays;
      if (academicTerm?.termStart) termData.termStart = new Date(academicTerm.termStart).toISOString();
      if (academicTerm?.termEnd) termData.termEnd = new Date(academicTerm.termEnd).toISOString();

      await upsertTerm(termData);
      toast.success("Grading system saved successfully", {
        description: "Your grading settings have been updated",
      });
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to save grading system", {
        description: getErrorMessage(err),
      });
    }
  }

  const loading = form.formState.isSubmitting || isMutating;
  const gradingEntry = form.watch("gradingEntry") || [];

  return (
    <Card className="border shadow-md p-0 pb-4">
      <CardContent className="p-0">
        <Form {...form}>
          {/* Grading System Form */}
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors: any) => {
              if (errors.gradingEntry?.message) {
                toast.error("Grading entry error", { description: errors.gradingEntry.message });
                return;
              }
              toast.error("Validation error", {
                description: "Please fix the grading system fields and try again.",
              });
            })}
            className="space-y-6"
          >

            {/* Grading Entry Dialog */}
            <section className="space-y-4">
              <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
                <DialogContent>

                  {/* Dialog Header: Edit Grade Range, Add Grade Range */}
                  <DialogHeader>
                    <DialogTitle>
                      {editingIndex !== null ? "Edit Grade Range" : "Add Grade Range"}
                    </DialogTitle>
                    {/* Dialog Description: Enter grade, minimum score, and maximum score */}
                    <DialogDescription>
                      Enter grade, minimum score, and maximum score.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Grading Entry Inputs: Grade, Min Score, Max Score */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Input
                      type="text"
                      placeholder="Grade (A, B, C...)"
                      value={currentGradingEntry.grade}
                      onChange={(e) => setCurrentGradingEntry({ ...currentGradingEntry, grade: e.target.value })}
                      className="h-12 md:h-14 text-sm md:text-base"
                    />
                    <Input
                      placeholder="Min Score"
                      type="number"
                      min="0"
                      value={currentGradingEntry.minScore}
                      onChange={(e) => setCurrentGradingEntry({ ...currentGradingEntry, minScore: e.target.value })}
                      className="h-12 md:h-14 text-sm md:text-base"
                    />
                    <Input
                      placeholder="Max Score"
                      type="number"
                      min="0"
                      max="100"
                      value={currentGradingEntry.maxScore}
                      onChange={(e) => setCurrentGradingEntry({ ...currentGradingEntry, maxScore: e.target.value })}
                      className="h-12 md:h-14 text-sm md:text-base"
                    />
                  </div>

                  {/* Dialog Footer: Cancel, Save */}
                  <DialogFooter>
                    {editingIndex !== null ? (
                      <>
                        <Button type="button" onClick={cancelEdit} variant="outline">
                          <X className="w-4 h-4" />
                        </Button>
                        <Button type="button" onClick={addGradingEntry}>
                          <Check className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button type="button" onClick={addGradingEntry}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>

                {/* Grading Entry Table */}
                {gradingEntry.length > 0 && (
                  <div className="overflow-x-auto rounded-xs border border-border bg-card">
                    <table className="min-w-[320px] w-full border-collapse text-sm md:text-base text-center">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="p-3 text-center font-semibold text-muted-foreground">Range</th>
                          <th className="p-3 text-center font-semibold text-muted-foreground">Grade</th>
                          <th className="p-3 text-center font-semibold text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradingEntry
                          .map((entry, originalIndex) => ({ entry, originalIndex }))
                          .sort((a, b) => Number(b.entry.maxScore) - Number(a.entry.maxScore))
                          .map(({ entry, originalIndex }) => (
                            <tr
                              key={originalIndex}
                              className={`border-b border-border last:border-b-0 ${editingIndex === originalIndex ? "bg-primary/10" : "hover:bg-muted/40"}`}
                            >
                              <td className="p-3 text-foreground">
                                {entry.minScore} - {entry.maxScore}
                              </td>
                              <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                                {entry.grade}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => editGradingEntry(originalIndex)}
                                    className="text-sm md:text-base hover:text-primary/80 bg-primary-5"
                                    disabled={editingIndex !== null && editingIndex !== originalIndex}
                                  >
                                    <Pencil className="w-4 md:w-5 h-4 md:h-5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeGradingEntry(originalIndex)}
                                    className="text-sm md:text-base text-destructive hover:text-destructive/80"
                                    disabled={editingIndex !== null}
                                  >
                                    <X className="w-4 md:w-5 h-4 md:h-5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Dialog Trigger Button */}
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (editingIndex === null) {
                        setCurrentGradingEntry(initialGradingEntry);
                      }
                    }}
                    className="h-12 md:h-14 text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Grade
                  </Button>
                </DialogTrigger>

              </Dialog>
            </section>

            <FormField
              control={form.control}
              name="gradingEntry"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discard Changes, Save Changes Buttons */}
            <div className="pt-4 md:pt-6 border-t border-border mt-4 md:mt-6">
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!form.formState.isDirty || loading}
                  onClick={() => {
                    form.reset(defaultValues);
                    cancelEdit();
                  }}
                  className="w-max h-12 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                >
                  Discard Changes
                </Button>
                <LoadingButton
                  type="submit"
                  loading={loading}
                  disabled={!form.formState.isDirty || loading || editingIndex !== null}
                  className="w-max h-12 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                >
                  Save Changes
                </LoadingButton>
              </div>
            </div>


          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
