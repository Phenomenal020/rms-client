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
import { Textarea } from "@/shadcn/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { updateSchool } from "@/app/api/school/actions";
import type { SchoolData } from "./types";

// Convert empty strings to undefined for schema validation === 'no db update'
const emptyToUndefined = z
  .string()
  .transform((v) => (v.trim() === "" ? undefined : v));

// Schema for school form (only school fields)
const schoolSchema = z.object({
  schoolName: z.string().trim().min(1, { message: "School name is required" }),
  schoolAddress: emptyToUndefined.optional(),
  schoolMotto: emptyToUndefined.optional(),
  schoolTelephone: emptyToUndefined.optional(),
  schoolEmail: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return z.string().email().safeParse(val).success;
      },
      { message: "Invalid email address" }
    ),
});

// Type for form values
type SchoolFormValues = z.infer<typeof schoolSchema>;

// Props interface for SchoolForm
interface SchoolFormProps {
  school: SchoolData;
}

// School form component
export function SchoolForm({ school }: SchoolFormProps) {

  // to refresh on successful update
  const router = useRouter();

  // useForm hook to handle the form state and validation
  const form = useForm<SchoolFormValues>({
    // form validation with zodResolver
    resolver: zodResolver(schoolSchema),
    // default values for the form
    defaultValues: {
      schoolName: school?.schoolName || "",
      schoolAddress: school?.schoolAddress || "",
      schoolMotto: school?.schoolMotto || "",
      schoolTelephone: school?.schoolTelephone || "",
      schoolEmail: school?.schoolEmail || "",
    },
  });

  async function onSubmit(data: SchoolFormValues) {
    try {
      // call the updateSchool server action to update the school information
      const result = await updateSchool(data);

      if (result.error) {
        toast.error("Failed to update school information", {
          description:  "Please review the form details and try again",
        });
        return;
      }

      toast.success("School information updated successfully", {
        description: "Your school details have been saved",
      });
      router.refresh();
    } catch (err) {
      toast.error("Failed to update school information", {
        description: "An unexpected error occurred",
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

            <div className="space-y-6">
              {/* School Information Section Header Text*/}
              <div className="pb-2 border-b border-gray-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-700 uppercase tracking-wide">
                  School Information
                </h3>
              </div>

              {/* School Name */}
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }: { field: ControllerRenderProps<SchoolFormValues, "schoolName"> }) => (
                  <FormItem>
                    <FormLabel className="text-base text-gray-700 font-semibold">School Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="Enter school name"
                        className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* School Address */}
              <FormField
                control={form.control}
                name="schoolAddress"
                render={({ field }: { field: ControllerRenderProps<SchoolFormValues, "schoolAddress"> }) => (
                  <FormItem>
                    <FormLabel className="text-base text-gray-700 font-semibold">Address (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="Enter school address or location"
                        className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* School Motto */}
              <FormField
                control={form.control}
                name="schoolMotto"
                render={({ field }: { field: ControllerRenderProps<SchoolFormValues, "schoolMotto"> }) => (
                  <FormItem>
                    <FormLabel className="text-base text-gray-700 font-semibold">Motto (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter your school motto if you want this to appear on the result sheet"
                        className="min-h-20 text-base transition-colors hover:border-gray-400 focus:border-primary"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* School Telephone and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* School Telephone */}
                <FormField
                  control={form.control}
                  name="schoolTelephone"
                  render={({ field }: { field: ControllerRenderProps<SchoolFormValues, "schoolTelephone"> }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Telephone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Enter school telephone number"
                          className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* School Email */}
                <FormField
                  control={form.control}
                  name="schoolEmail"
                  render={({ field }: { field: ControllerRenderProps<SchoolFormValues, "schoolEmail"> }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Email (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter school email address"
                          className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 mt-6">
              <div className="flex justify-center">
                <LoadingButton
                  type="submit"
                  loading={loading}
                  disabled={!form.formState.isDirty}
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