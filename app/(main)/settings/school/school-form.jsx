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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { updateSchool } from "@/app/api/school/actions";

// Convert empty strings to undefined for schema validation === 'no db update'
const emptyToUndefined = z
  .string()
  .transform((v) => (v.trim() === "" ? undefined : v));

// Schema for optional email validation
const emailSchema = z
  .preprocess((val) => {
    if (typeof val !== "string") return val;  // if not a string, return the value for email validation with z.email()
    const trimmed = val.trim();
    return trimmed === "" ? undefined : trimmed;
  }, z.email("Invalid email address").optional());

// Schema for school form (only school fields)
const schoolSchema = z.object({
  schoolName: z.string().trim().min(1, { message: "School name is required" }),
  schoolAddress: emptyToUndefined.optional(),
  schoolMotto: emptyToUndefined.optional(),
  schoolTelephone: emptyToUndefined.optional(),
  schoolEmail: emailSchema,
});

// School form component
export function SchoolForm({ school }) {

  // to refresh on successful update
  const router = useRouter();

  // useForm hook to handle the form state and validation
  const form = useForm({
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

  async function onSubmit(data) {
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
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                  School Information
                </h3>
              </div>

              {/* School Name */}
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">School Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter school name"
                        className="transition-colors hover:border-gray-400 focus:border-primary"
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Address (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter school address or location"
                        className="transition-colors hover:border-gray-400 focus:border-primary"
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Motto (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter your school motto if you want this to appear on the result sheet"
                        className="transition-colors hover:border-gray-400 focus:border-primary"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Telephone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Enter school telephone number"
                          className="transition-colors hover:border-gray-400 focus:border-primary"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Email (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter school email address"
                          className="transition-colors hover:border-gray-400 focus:border-primary"
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

