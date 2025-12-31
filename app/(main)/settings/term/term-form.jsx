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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { GradingSystem } from "./grading-system";
import { updateTerm } from "@/app/api/term/actions";

// Schema for term form
const termSchema = z.object({
  academicYear: z.string().trim().min(1, { message: "Academic year is required" }),
  term: z.enum(["FIRST", "SECOND", "THIRD"], { errorMap: () => ({ message: "Please select a valid term" }) }),
  className: z.string().trim().min(1, { message: "Class name is required" }),
  termDays: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = typeof val === "string" ? Number(val) : val;
      return Number.isNaN(num) ? undefined : num;
    },
    z.number().int().nonnegative().optional()
  ),
  termStart: z.date().optional(),
  termEnd: z.date().optional(),
  gradingSystem: z
    .array(z.object({
      grade: z.string().min(1),
      minScore: z.number().min(0).max(100),
      maxScore: z.number().min(0).max(100),
    }))
    .min(1, { message: "At least one grading entry is required" })
    // Validate score range and type
    .refine((gradingSystem) => {
      return gradingSystem.every((entry) => {
        const minScore = typeof entry.minScore === 'number' ? entry.minScore : Number(entry.minScore);
        const maxScore = typeof entry.maxScore === 'number' ? entry.maxScore : Number(entry.maxScore);
        return !isNaN(minScore) && !isNaN(maxScore) &&
          minScore >= 0 && maxScore <= 100 &&
          minScore <= maxScore;
      });
    }, {
      message: "Scores must be valid numbers between 0-100, and min score must be less than or equal to max score",
      path: ["gradingSystem"],
    })
    // validate overlapping entries
    .refine((gradingSystem) => {
      const ranges = gradingSystem
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
      path: ["gradingSystem"],
    })
    // validate total score range
    .refine((gradingSystem) => {
      const ranges = gradingSystem
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
      path: ["gradingSystem"],
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

// Term form component
export function TermForm({ academicTerm, schoolId }) {

  // state for the term start date popover
  const [termStartOpen, setTermStartOpen] = useState(false);

  // state for the term end date popover
  const [termEndOpen, setTermEndOpen] = useState(false);

  // state for the current grading entry
  const [currentGradingEntry, setCurrentGradingEntry] = useState({
    grade: "",
    minScore: "",
    maxScore: "",
  });

  // state for the editing index
  const [editingIndex, setEditingIndex] = useState(null);

  // router for navigation
  const router = useRouter();

  // grading system for the academic term
  const gradingSystem = academicTerm?.gradingSystem || [];

  const form = useForm({
    // form validation with zodResolver
    resolver: zodResolver(termSchema),
    // default values for the form
    defaultValues: {
      academicYear: academicTerm?.academicYear || "",
      term: academicTerm?.term || "FIRST",
      className: academicTerm?.class?.name || "",
      termDays: academicTerm?.termDays ?? undefined,
      termStart: academicTerm?.termStart ? new Date(academicTerm.termStart) : undefined,
      termEnd: academicTerm?.termEnd ? new Date(academicTerm.termEnd) : undefined,
      gradingSystem: gradingSystem,
    },
  });

  // Add grading entry
  const addGradingEntry = () => {
    // get the current grading entry values
    const { grade, minScore, maxScore } = currentGradingEntry;

    if (grade.trim() && minScore && maxScore) {
      // convert the min and max scores to numbers
      const minScoreNum = parseInt(minScore);
      const maxScoreNum = parseInt(maxScore);

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

      // get the current grading system
      const currentGrading = form.getValues("gradingSystem") || [];

      // validate the grading system for overlapping entries
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
        form.setValue("gradingSystem", updatedGrading);
        form.trigger("gradingSystem");
        setEditingIndex(null);
      } else {
        // if not in editing mode, simply append the new grading entry
        form.setValue("gradingSystem", [
          ...currentGrading,
          { grade: grade.trim(), minScore: Number(minScore), maxScore: Number(maxScore) },
        ]);
        form.trigger("gradingSystem");
      }
      setCurrentGradingEntry({ grade: "", minScore: "", maxScore: "" });
    }
  };

  // Edit grading entry - simply set the current grading entry and editing index to not null
  const editGradingEntry = (index) => {
    const allGrades = form.getValues("gradingSystem") || [];
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
  const removeGradingEntry = (index) => {
    // get the current grading system
    const currentGrading = form.getValues("gradingSystem") || [];
    // filter out the grading entry at the index
    form.setValue(
      "gradingSystem",
      currentGrading.filter((_, i) => i !== index)
    );
    // trigger the grading system validation
    form.trigger("gradingSystem");
    // if in editing mode, cancel the edit
    if (editingIndex === index) {
      cancelEdit();
    }
  };

  async function onSubmit(data) {
    try {
      const termData = {
        academicYear: data.academicYear, // must have been validated by zod schema before getting here
        term: data.term,
        className: data.className,
        termDays: data.termDays ?? undefined,
        termStart: data.termStart?.toISOString(),  
        termEnd: data.termEnd?.toISOString(),
        gradingSystem: data.gradingSystem
          ? data.gradingSystem.map((entry) => ({
            grade: entry.grade,
            minScore: Number(entry.minScore),
            maxScore: Number(entry.maxScore),
            remark: entry.remark ?? null,
          }))
          : undefined,
        resultTemplateUrl: undefined, // TODO: Handle file upload
      };
      
      // call the updateTerm server action to update the term information
      const result = await updateTerm(termData);

      // if there is an error, show the error toast
      if (result.error) {
        toast.error("Failed to update term information", {
          description:  "Please review the form details and try again",
        });
        return;
      }

      // if there is no error, show the success toast and refresh the page
      toast.success("Term information updated successfully", {
        description: "Your term details have been saved",
      });
      router.refresh();
    } catch (err) {
      // if there is an unexpected error, show the error toast
      toast.error("Failed to update term information", {
        description: "An unexpected error occurred",
      });
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <Card className="border shadow-md">
      <CardContent className="pt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              async (data) => {
                await onSubmit(data);
              },
              (errors) => {
                if (errors.gradingSystem) {
                  const gradingError = errors?.gradingSystem?.gradingSystem?.message;
                  if (gradingError) {
                    toast.error("Grading system error", {
                      description: gradingError,
                    });
                  }
                }
              }
            )}
            className="space-y-6"
          >
            {/* Term Information Section */}
            <div className="space-y-6">
              <div className="pb-2 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Term Information</h3>
              </div>

              {/* Term and Academic Year Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Academic Year Field */}
                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Academic Year</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., 2024/2025"
                          className="transition-colors hover:border-gray-400 focus:border-primary"
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
                      <FormLabel className="text-gray-700 font-semibold">Class Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., JSS 1A"
                          className="transition-colors hover:border-gray-400 focus:border-primary"
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
                      <FormLabel className="text-gray-700 font-semibold">Term</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormLabel className="text-gray-700 font-semibold">Term Start Date (Optional)</FormLabel>
                      <Popover open={termStartOpen} onOpenChange={setTermStartOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal"
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
                            onSelect={(date) => {
                              field.onChange(date);
                              setTermStartOpen(false);
                            }}
                            initialFocus
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
                      <FormLabel className="text-gray-700 font-semibold">Term End Date (Optional)</FormLabel>
                      <Popover open={termEndOpen} onOpenChange={setTermEndOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal"
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
                            onSelect={(date) => {
                              field.onChange(date);
                              setTermEndOpen(false);
                            }}
                            initialFocus
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
                      <FormLabel className="text-gray-700 font-semibold">Term Days (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          placeholder="Enter number of days in term"
                          className="transition-colors hover:border-gray-400 focus:border-primary"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : Number(e.target.value);
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
              form={form}
              currentGradingEntry={currentGradingEntry}
              setCurrentGradingEntry={setCurrentGradingEntry}
              addGradingEntry={addGradingEntry}
              editGradingEntry={editGradingEntry}
              removeGradingEntry={removeGradingEntry}
              editingIndex={editingIndex}
              cancelEdit={cancelEdit}
            />

            {/* Result Template Section */}
            <div className="space-y-4 mt-8 pt-8 border-t border-gray-200">
              <div className="pb-2 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Result Template (Optional)</h3>
              </div>

              <FormField
                control={form.control}
                name="resultTemplate"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Upload Template</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="file"
                        accept=".pdf,.doc,.docx,.xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file);
                        }}
                        className="transition-colors hover:border-gray-400 focus:border-primary"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-600">
                      Upload a template for student results (PDF, Word, or Excel)
                    </p>
                    {value && (
                      <p className="text-sm text-green-600 font-medium">✓ {value.name}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 mt-6">
              <div className="flex justify-center">
                <LoadingButton
                  type="submit"
                  loading={loading}
                  className="w-full sm:w-auto min-w-[160px] h-10 font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
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