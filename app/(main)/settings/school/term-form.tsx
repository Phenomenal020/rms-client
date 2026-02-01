"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent } from "@/shadcn/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Calendar } from "@/shadcn/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm, type Control } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { GradingSystem } from "./grading-system";
import { useUpsertTerm } from "@/fetcher/mutations";
// import type { AcademicTermData } from "./types";   // TODO: Fix this to be derived from the payload type
import type { GradingEntry } from "@/types/term";

// Schema for term form 
const termSchema = z.object({
  academicYear: z.string().trim().min(1, { message: "Academic year is required" }),
  term: z.enum(["FIRST", "SECOND", "THIRD"], { message: "Please select a valid term" }),
  className: z.string().trim().min(1, { message: "Class name is required" }),
  termDays: z.number().int().nonnegative().optional(),
  termStart: z.date().optional(),
  termEnd: z.date().optional(),
  gradingEntry: z
    .array(z.object({
      grade: z.string().min(1),
      minScore: z.number().min(0).max(100),
      maxScore: z.number().min(0).max(100),
    }))
    .min(1, { message: "At least one grading entry is required" })
    // Validate score range and type (numbers between 0-100)
    .refine((gradingEntry) => {
      return gradingEntry.every((entry) => {
        const minScore = typeof entry.minScore === 'number' ? entry.minScore : Number(entry.minScore);
        const maxScore = typeof entry.maxScore === 'number' ? entry.maxScore : Number(entry.maxScore);
        return !isNaN(minScore) && !isNaN(maxScore) &&
          minScore >= 0 && maxScore <= 100 &&
          minScore <= maxScore;
      });
    }, {
      message: "Scores must be valid numbers between 0-100, and min score must be less than or equal to max score",
      path: ["gradingEntry"],
    })
    // validate overlapping entries (no overlapping ranges)
    .refine((gradingEntry) => {
      const ranges = gradingEntry
        .map((entry) => ({
          min: typeof entry.minScore === 'number' ? entry.minScore : Number(entry.minScore),
          max: typeof entry.maxScore === 'number' ? entry.maxScore : Number(entry.maxScore),
        }))
        .filter((range) => !isNaN(range.min) && !isNaN(range.max))
        .sort((a, b) => a.min - b.min);

      if (ranges.length === 0) return false;

      for (let i = 0; i < ranges.length - 1; i++) {
        if (ranges[i].max > ranges[i + 1].min) {
          return false;
        }
      }
      return true;
    }, {
      message: "Grade ranges cannot overlap",
      path: ["gradingEntry"],
    })
    // validate total score range (100 with no gaps)
    .refine((gradingEntry) => {
      const ranges = gradingEntry
        .map((entry) => ({
          min: typeof entry.minScore === 'number' ? entry.minScore : Number(entry.minScore),
          max: typeof entry.maxScore === 'number' ? entry.maxScore : Number(entry.maxScore),
        }))
        .filter((range) => !isNaN(range.min) && !isNaN(range.max))
        .sort((a, b) => a.min - b.min);

      if (ranges.length === 0) return false;

      let currentPos = -1;
      for (let range of ranges) {
        if (range.min !== currentPos + 1) {
          return false;
        }
        currentPos = range.max;
      }
      return currentPos === 100;
    }, {
      message: "Grade ranges must total exactly 100% (0-100) with no gaps",
      path: ["gradingEntry"],
    }),
  resultTemplate: z.instanceof(File).optional(),
}).refine((data) => {
  // validate term end date is after term start date
  if (data.termStart && data.termEnd) {
    return data.termEnd > data.termStart;
  }
  return true;
}, {
  message: "Term end date must be after term start date",
  path: ["termEnd"],
});

// Type for form values
export type TermFormValues = z.infer<typeof termSchema>;

// Props interface for TermForm
interface TermFormProps {
  academicTerm: any;
}

// Term form component
export function TermForm({ academicTerm }: TermFormProps) {

  // state for the term start date popover
  const [termStartOpen, setTermStartOpen] = useState(false);

  // state for the term end date popover
  const [termEndOpen, setTermEndOpen] = useState(false);

  // state for the current grading entry
  const initialGradingEntry: GradingEntry = {
    grade: "",
    minScore: "",
    maxScore: "",
  };
  const [currentGradingEntry, setCurrentGradingEntry] = useState<GradingEntry>(initialGradingEntry);

  // state for the editing index
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // router for navigation
  const router = useRouter();

  // grading entries for the academic term
  const gradingEntry = academicTerm?.gradingEntry || [];

  // mutation hook for upserting term
  const { upsertTerm, isMutating, error } = useUpsertTerm();

  // form resolver and default values
  const originalValues = useMemo(() => ({
    academicYear: academicTerm?.academicYear || "",
    term: (academicTerm?.term as "FIRST" | "SECOND" | "THIRD") || "FIRST",
    className: academicTerm?.class?.name || "",
    termDays: academicTerm?.termDays ?? undefined,
    termStart: academicTerm?.termStart ? new Date(academicTerm.termStart) : undefined,
    termEnd: academicTerm?.termEnd ? new Date(academicTerm.termEnd) : undefined,
    gradingEntry: gradingEntry.map((g: GradingEntry) => ({
      grade: g.grade,
      minScore: g.minScore,
      maxScore: g.maxScore,
    })),
  }), [academicTerm, gradingEntry]);
  const form = useForm<TermFormValues>({
    // form validation with zodResolver
    resolver: zodResolver(termSchema),
    // default values for the form
    defaultValues: originalValues,
  });

  // Add grading entry
  const addGradingEntry = () => {
    // get the current grading entry values
    const { grade, minScore, maxScore } = currentGradingEntry;

    if (grade.trim() && minScore && maxScore) {
      // convert the min and max scores to numbers
      const minScoreNum = typeof minScore === 'number' ? minScore : parseInt(minScore);
      const maxScoreNum = typeof maxScore === 'number' ? maxScore : parseInt(maxScore);

      // validate the min score is greater than or equal to 0
      if (minScoreNum < 0) {
        toast.error("Minimum score must be greater than or equal to 0");
        return;
      }

      // validate the max score is less than or equal to 100
      if (maxScoreNum > 100) {
        toast.error("Maximum score must be less than or equal to 100");
        return;
      }

      // validate the max score is greater than the min score
      if (minScoreNum >= maxScoreNum) {
        toast.error("Maximum score must be greater than minimum score");
        return;
      }

      // get the current grading entries
      const currentGrading = form.getValues("gradingEntry") || [];

      // validate the grading entries for overlapping entries
      const hasOverlap = currentGrading.some((entry, idx) => {
        if (editingIndex !== null && idx === editingIndex) return false;
        const existingMin = typeof entry.minScore === 'number' ? entry.minScore : Number(entry.minScore);
        const existingMax = typeof entry.maxScore === 'number' ? entry.maxScore : Number(entry.maxScore);
        return minScoreNum < existingMax && maxScoreNum > existingMin;
      });

      if (hasOverlap) {
        toast.error("This grade range overlaps with an existing range");
        return;
      }

      // if in editing mode, update an existing grading entry
      if (editingIndex !== null) {
        const updatedGrading = [...currentGrading];
        updatedGrading[editingIndex] = {
          grade: grade.trim(),
          minScore: Number(minScore),
          maxScore: Number(maxScore)
        };
        form.setValue("gradingEntry", updatedGrading);
        form.trigger("gradingEntry");
        setEditingIndex(null);
      } else {
        // if not in editing mode, simply append the new grading entry
        form.setValue("gradingEntry", [
          ...currentGrading,
          { grade: grade.trim(), minScore: Number(minScore), maxScore: Number(maxScore) },
        ]);
        form.trigger("gradingEntry");
      }
      setCurrentGradingEntry({ grade: "", minScore: "", maxScore: "" });
    }
  };

  // Edit grading entry - simply set the current grading entry and editing index to not null
  const editGradingEntry = (index: number) => {
    const allGrades: GradingEntry[] = form.getValues("gradingEntry") || [];
    const entryToEdit = allGrades[index];

    if (entryToEdit) {
      setCurrentGradingEntry({
        grade: entryToEdit.grade,
        minScore: String(entryToEdit.minScore ?? ""),
        maxScore: String(entryToEdit.maxScore ?? ""),
      });
      setEditingIndex(index);
    }
  };

  // Cancel edit mode - simply clear the current grading entry and editing index to null
  const cancelEdit = () => {
    setCurrentGradingEntry({ grade: "", minScore: "", maxScore: "" });
    setEditingIndex(null);
  };

  // Remove grading entry - simply filter out the grading entry at the index
  const removeGradingEntry = (index: number) => {
    // get the current grading entries
    const currentGrading = form.getValues("gradingEntry") || [];
    // filter out the grading entry at the index
    form.setValue(
      "gradingEntry",
      currentGrading.filter((_, i) => i !== index)
    );
    // trigger the grading entry validation
    form.trigger("gradingEntry");
    // if in editing mode, cancel the edit
    if (editingIndex === index) {
      cancelEdit();
    }
  };

  // On submit function
  async function onSubmit(data: TermFormValues) {
    try {
      const { dirtyFields } = form.formState;

      // Required fields always sent for upsert
      const termData: any = {
        academicYear: data.academicYear,
        term: data.term,
        className: data.className,
      };

      // Only add optional fields if they've changed
      // If field is in dirtyFields, it was changed:
      // - If value is undefined/null, user cleared it → send null to clear DB
      // - If value exists, send the value
      if (dirtyFields.termDays !== undefined) {
        // If termDays was cleared (undefined), send null; otherwise send the number
        termData.termDays = data.termDays ?? null;
      }

      if (dirtyFields.termStart !== undefined) {
        // If termStart was cleared (undefined), send null; otherwise send ISO string
        termData.termStart = data.termStart?.toISOString() ?? null;
      }

      if (dirtyFields.termEnd !== undefined) {
        // If termEnd was cleared (undefined), send null; otherwise send ISO string
        termData.termEnd = data.termEnd?.toISOString() ?? null;
      }

      // Always send gradingEntry (required field)
      termData.gradingEntry = data.gradingEntry.map((entry) => ({
        grade: entry.grade,
        minScore: Number(entry.minScore),
        maxScore: Number(entry.maxScore),
        remark: null,  // adds remark to match the backend dto
      }))

      // call the upsertTerm mutation to create or update the term information
      await upsertTerm(termData);

      // Success is handled by the mutation's onSuccess callback (cache invalidation)
      // Show success toast
      toast.success("Term information saved successfully", {
        description: "Your term details have been saved",
      });
    }
    catch (err: any) {
      // Error handling - the mutation's onError already logs it
      // Show user-friendly error message
      const errorMessage = err?.response?.data?.message || err?.message || "An unexpected error occurred";
      toast.error("Failed to save term information", {
        description: errorMessage,
      });
    }
  }

  const loading = form.formState.isSubmitting || isMutating;

  return (
    <Card className="border shadow-md">
      <CardContent className="pt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              async (data) => {
                await onSubmit(data as TermFormValues);
              },
              (errors: any) => {
                // Check for grading entry errors first (most common)
                if (errors.gradingEntry?.gradingEntry) {
                  const gradingError = errors?.gradingEntry?.gradingEntry?.message;
                  if (gradingError) {
                    toast.error("Grading entry error", {
                      description: gradingError,
                    });
                    return; // Stop here, don't show other errors
                  }
                }

                // Check for other field errors
                const errorFields = Object.keys(errors);
                if (errorFields.length > 0) {
                  const firstErrorField = errorFields[0];
                  const firstError = errors[firstErrorField];
                  const errorMessage = firstError?.message || `Please fix the ${firstErrorField} field`;

                  toast.error("Validation error", {
                    description: errorMessage,
                  });
                } else {
                  // Fallback if no specific error message
                  toast.error("Please fix the form errors", {
                    description: "One or more fields have validation errors",
                  });
                }
              }
            )}
            className="space-y-6"
          >

            {/* Term Information Section */}
            <div className="space-y-6">
              <div className="pb-2 border-b border-gray-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-700 uppercase tracking-wide">Term Information</h3>
              </div>

              {/* Term and Academic Year Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Academic Year Field */}
                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Academic Year</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          placeholder="e.g., 2024/2025"
                          className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Class Name Field */}
                <FormField
                  control={form.control}
                  name="className"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Class Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          placeholder="e.g., JSS 1A"
                          className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Term Field */}
                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Term</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 text-base w-full">
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FIRST">First</SelectItem>
                          <SelectItem value="SECOND">Second</SelectItem>
                          <SelectItem value="THIRD">Third</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Term Start and End Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Term Start Date */}
                <FormField
                  control={form.control}
                  name="termStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Term Start Date (Optional)</FormLabel>
                      <Popover open={termStartOpen} onOpenChange={setTermStartOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="default"
                              className="w-full h-14 text-base justify-between font-normal"
                            >
                              {field.value ? format(field.value, "PPP") : "Select date"}
                              <ChevronDown className="w-4 h-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            captionLayout="dropdown"
                            onSelect={(date: Date | undefined) => {
                              field.onChange(date);
                              setTermStartOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Term End Date */}
                <FormField
                  control={form.control}
                  name="termEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Term End Date (Optional)</FormLabel>
                      <Popover open={termEndOpen} onOpenChange={setTermEndOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="default"
                              className="w-full h-14 text-base justify-between font-normal"
                            >
                              {field.value ? format(field.value, "PPP") : "Select date"}
                              <ChevronDown className="w-4 h-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            captionLayout="dropdown"
                            onSelect={(date: Date | undefined) => {
                              field.onChange(date);
                              setTermEndOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Term Days Field */}
                <FormField
                  control={form.control}
                  name="termDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Term Days (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          placeholder="Enter number of days in term"
                          className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                          value={field.value || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value === "0" ? undefined : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Grading System Section */}
            <GradingSystem
              form={form as any}
              currentGradingEntry={currentGradingEntry}
              setCurrentGradingEntry={setCurrentGradingEntry}
              addGradingEntry={addGradingEntry}
              editGradingEntry={editGradingEntry}
              removeGradingEntry={removeGradingEntry}
              editingIndex={editingIndex}
              cancelEdit={cancelEdit}
            />

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 mt-6">
              <div className="flex justify-center">
                <LoadingButton
                  type="submit"
                  loading={loading}
                  disabled={!form.formState.isDirty || loading || editingIndex !== null}
                  className="w-full sm:w-auto min-w-[160px] h-12 text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
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