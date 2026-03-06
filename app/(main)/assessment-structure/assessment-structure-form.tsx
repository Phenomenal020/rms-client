"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X, Pencil, Check } from "lucide-react";
import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
import type { AssessmentStructure, UpsertAssessmentStructurePayload } from "@/types/school";
import { useUpsertAssessmentStructures, getErrorMessage } from "@/fetcher/mutations";

/* Assessment Structure Schema */
const assessmentStructureSchema = z.object({
  id: z.string().optional(),
  type: z.string().trim().min(1, { message: "Assessment type is required" }),
  percentage: z
    .string()
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, { message: "Percentage must be a number between 0 and 100" }),
  order: z.number().int().min(1, { message: "Order must be a positive integer" }),
});

/* Assessment Structure Form Schema */
const assessmentStructureFormSchema = z.object({
  assessmentStructure: z
    .array(assessmentStructureSchema)
    .min(1, { message: "At least one assessment component is required" })
    .refine((assessments) => {
      const total = assessments.reduce(
        (sum, currentValue) => sum + (parseFloat(currentValue.percentage) || 0),
        0
      );
      return total === 100;
    }, { message: "Assessment percentages must total exactly 100%" }),
});

/* Assessment Structure Form Values */
type AssessmentStructureFormValues = z.infer<typeof assessmentStructureFormSchema>;

/* Assessment Structure Form Props */
interface AssessmentStructureFormProps {
  assessmentStructure: AssessmentStructure[] | null | undefined;
}

/* Assessment Structure Form */
export function AssessmentStructureForm({ assessmentStructure }: AssessmentStructureFormProps) {
  const router = useRouter();
  const { upsertAssessmentStructures, isMutating } = useUpsertAssessmentStructures();

  /* Initial Assessment Entry */
  const initialAssessmentEntry = {
    id: undefined as string | undefined,
    type: "",
    percentage: "",
    order: "",
  };

  const [currentAssessmentEntry, setCurrentAssessmentEntry] = useState(initialAssessmentEntry);
  const [editingAssessmentIndex, setEditingAssessmentIndex] = useState<number | null>(null);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);

  const form = useForm<AssessmentStructureFormValues>({
    resolver: zodResolver(assessmentStructureFormSchema),
    defaultValues: {
      assessmentStructure: assessmentStructure
        ? assessmentStructure
          .map((assess) => ({
            id: assess.id || undefined,
            type: assess.type || "",
            percentage: String(assess.percentage) || "",
            order: assess.order || 1,
          }))
          .sort((a, b) => a.order - b.order)
        : [],
    },
  });

  const { fields: assessmentFields, append: _appendAssessment, remove: _removeAssessment, update: _updateAssessment } = useFieldArray({
    control: form.control,
    name: "assessmentStructure",
    keyName: "tempId",
  });

  const addOrUpdateAssessmentEntry = () => {
    const { id, type, percentage, order } = currentAssessmentEntry;

    if (!type.trim()) {
      toast.error("Assessment type is required");
      return;
    }

    const percentageNum = parseFloat(percentage.trim());
    if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      toast.error("Percentage must be a number between 0 and 100");
      return;
    }

    const orderNum = Number(order);
    if (isNaN(orderNum) || orderNum < 1) {
      toast.error("Order must be a positive integer");
      return;
    }

    const currentAssessments = form.getValues("assessmentStructure") || [];
    const duplicateOrder = currentAssessments.some((assess, idx) =>
      editingAssessmentIndex !== null ? idx !== editingAssessmentIndex && assess.order === orderNum : assess.order === orderNum
    );

    if (duplicateOrder) {
      toast.error(`Order ${orderNum} is already used. Please choose a different order number.`);
      return;
    }

    let total = currentAssessments.reduce(
      (sum, entry) => sum + (parseFloat(entry.percentage) || 0),
      0
    );

    if (editingAssessmentIndex !== null) {
      const oldPercentage = parseFloat(currentAssessments[editingAssessmentIndex]?.percentage || "0");
      total -= oldPercentage;
    }

    if (total + percentageNum > 100) {
      toast.error(`Total would exceed 100%. Current total: ${total}%`);
      return;
    }

    if (editingAssessmentIndex !== null) {
      _updateAssessment(editingAssessmentIndex, {
        id: id || undefined,
        type: type.trim(),
        percentage: percentage.trim(),
        order: orderNum,
      });
      toast.success(`Assessment "${type.trim()}" updated successfully`);
    } else {
      _appendAssessment({
        id: id || undefined,
        type: type.trim(),
        percentage: percentage.trim(),
        order: orderNum,
      });
      toast.success(`Assessment "${type.trim()}" added successfully`);
    }

    form.trigger("assessmentStructure");
    setCurrentAssessmentEntry(initialAssessmentEntry);
    setEditingAssessmentIndex(null);
    setIsAssessmentDialogOpen(false);
  };

  const editAssessmentEntry = (index: number) => {
    const entryToEdit = form.getValues(`assessmentStructure.${index}`);
    if (!entryToEdit) {
      toast.error("Assessment entry not found");
      return;
    }

    setCurrentAssessmentEntry({
      id: entryToEdit.id || undefined,
      type: entryToEdit.type,
      percentage: entryToEdit.percentage,
      order: String(entryToEdit.order),
    });
    setEditingAssessmentIndex(index);
    setIsAssessmentDialogOpen(true);
  };

  const cancelEditAssessment = () => {
    setCurrentAssessmentEntry(initialAssessmentEntry);
    setEditingAssessmentIndex(null);
    setIsAssessmentDialogOpen(false);
  };

  const removeAssessmentEntry = (index: number) => {
    const entry = form.getValues(`assessmentStructure.${index}`);
    _removeAssessment(index);
    form.trigger("assessmentStructure");

    if (editingAssessmentIndex === index) {
      cancelEditAssessment();
    }

    toast.success(`Assessment "${entry?.type || "entry"}" removed successfully`);
  };

  async function onSubmit(data: AssessmentStructureFormValues) {
    try {
      const payload: UpsertAssessmentStructurePayload = data.assessmentStructure.map((as) => ({
        id: as.id || undefined,
        type: as.type.trim(),
        percentage: parseFloat(as.percentage),
        order: as.order,
      }));

      await upsertAssessmentStructures(payload);
      toast.success("Assessment structure updated successfully");
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to update assessment structure", {
        description: getErrorMessage(err),
      });
    }
  }

  const loading = form.formState.isSubmitting || isMutating;
  const total = form.watch("assessmentStructure").reduce(
    (sum, a) => sum + (parseFloat(a.percentage) || 0),
    0
  );

  return (
    <Card className="border shadow-md p-0 pb-4">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <section className="space-y-4">
              <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAssessmentIndex !== null ? "Edit Assessment" : "Add Assessment"}
                    </DialogTitle>
                    <DialogDescription>
                      Enter type, percentage and order for this assessment component.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Input
                      placeholder="Type (e.g. CA, Exam)"
                      value={currentAssessmentEntry.type}
                      onChange={(e) =>
                        setCurrentAssessmentEntry({ ...currentAssessmentEntry, type: e.target.value })
                      }
                      className="h-12 md:h-14 text-sm md:text-base"
                    />
                    <Input
                      placeholder="Percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={currentAssessmentEntry.percentage}
                      onChange={(e) =>
                        setCurrentAssessmentEntry({ ...currentAssessmentEntry, percentage: e.target.value })
                      }
                      className="h-12 md:h-14 text-sm md:text-base"
                    />
                    <Input
                      placeholder="Order"
                      type="number"
                      min="1"
                      value={currentAssessmentEntry.order}
                      onChange={(e) =>
                        setCurrentAssessmentEntry({ ...currentAssessmentEntry, order: e.target.value })
                      }
                      className="h-12 md:h-14 text-sm md:text-base"
                    />
                  </div>

                  <DialogFooter>
                    {editingAssessmentIndex !== null ? (
                      <>
                        <Button type="button" variant="outline" onClick={cancelEditAssessment} className="cursor-pointer">
                          <X className="w-4 h-4" />
                        </Button>
                        <Button type="button" onClick={addOrUpdateAssessmentEntry} className="cursor-pointer">
                          <Check className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button type="button" onClick={addOrUpdateAssessmentEntry} className="cursor-pointer">
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>

                {assessmentFields.length > 0 && (
                  <div className="overflow-x-auto rounded-xs border border-border bg-card">
                    <table className="min-w-[360px] w-full border-collapse text-sm md:text-base text-center">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="p-3 text-center font-semibold text-muted-foreground">Order</th>
                          <th className="p-3 text-center font-semibold text-muted-foreground">Type</th>
                          <th className="p-3 text-center font-semibold text-muted-foreground">Percentage</th>
                          <th className="p-3 text-center font-semibold text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessmentFields
                          .map((field, index) => {
                            const entry = form.getValues(`assessmentStructure.${index}`);
                            return { field, entry, originalIndex: index };
                          })
                          .sort((a, b) => (a.entry?.order || 999) - (b.entry?.order || 999))
                          .map(({ field, entry, originalIndex }) => (
                            <tr
                              key={field.tempId}
                              className={`border-b border-border last:border-b-0 ${editingAssessmentIndex === originalIndex
                                  ? "bg-primary/10"
                                  : "hover:bg-muted/40"
                                }`}
                            >
                              <td className="p-3 text-muted-foreground font-semibold">
                                #{entry?.order ?? "--"}
                              </td>
                              <td className="p-3 text-foreground">{entry?.type || "--"}</td>
                              <td className="p-3  ">
                                {entry?.percentage || 0}%
                              </td>
                              <td className="p-3">

                                {/* Edit/Cancel Buttons */}
                                <div className="flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => editAssessmentEntry(originalIndex)}
                                    className="text-sm md:text-base text-primary hover:text-primary/80 cursor-pointer"
                                    disabled={
                                      editingAssessmentIndex !== null &&
                                      editingAssessmentIndex !== originalIndex
                                    }
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeAssessmentEntry(originalIndex)}
                                    className="text-sm md:text-base text-destructive hover:text-destructive/80 cursor-pointer"
                                    disabled={editingAssessmentIndex !== null}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (editingAssessmentIndex === null) {
                        setCurrentAssessmentEntry(initialAssessmentEntry);
                      }
                    }}
                    className="h-12 md:h-14 text-sm md:text-base cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingAssessmentIndex !== null ? "Continue editing assessment" : "Add Assessment"}
                  </Button>
                </DialogTrigger>
              </Dialog>
            </section>

            {assessmentFields.length > 0 && (
              <div className="text-right">
                <div className="space-y-1">
                  {/* <span className={`text-xs md:text-sm font-medium ${total === 100 ? "text-primary" : "text-destructive"}`}>
                    Total: {total}%
                  </span> */}
                  {total !== 100 && (
                    <p className="text-xs text-destructive">
                      {total < 100
                        ? "Total should be 100%. Please add more assessment components."
                        : "Total should be 100%. Please adjust the percentages."}
                    </p>
                  )}
                  {/* {total === 100 && (
                    <p className="text-xs text-primary">
                      Total is 100%. Assessment structure is valid.
                    </p>
                  )} */}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="assessmentStructure"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 md:pt-6 border-t border-border mt-4 md:mt-6">
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!form.formState.isDirty || loading}
                  onClick={() => {
                    form.reset();
                    cancelEditAssessment();
                  }}
                  className="w-max h-12 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                >
                  Discard Changes
                </Button>
                <LoadingButton
                  type="submit"
                  disabled={loading || editingAssessmentIndex !== null || !form.formState.isDirty}
                  loading={loading}
                  className="w-max h-12 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
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
