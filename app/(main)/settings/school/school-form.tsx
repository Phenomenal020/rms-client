"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { Button } from "@/shadcn/ui/button";
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
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useUpsertSchool, getErrorMessage } from "@/fetcher/mutations";
import { School } from "@/types/school";  // for the props

// Zod Schema
// Convert empty strings to undefined and validate email if provided
const emailWithTransform = z
  .union([z.string(), z.undefined()])
  .transform((v) => (v && typeof v === 'string' && v.trim() !== "" ? v.trim() : undefined))
  .refine(
    (val) => {
      // If undefined or empty, it's valid (optional field)
      if (!val) return true;
      // Otherwise, validate it's a valid email
      return z.string().email().safeParse(val).success;
    },
    { message: "Invalid email address" }
  )
  .optional();
// Schema for school form (only school fields)
const schoolSchema = z.object({
  schoolName: z.string().trim().min(1, { message: "School name is required" }),
  schoolAddress: z.string().optional(),
  schoolMotto: z.string().optional(),
  schoolTelephone: z.string().optional(),
  schoolEmail: emailWithTransform,
});

// Type for form values
type SchoolFormValues = z.infer<typeof schoolSchema>;

// School form component
export function SchoolForm({ school }: { school: School }) {

  // mutation hook for upserting school
  const { upsertSchool, isMutating, error } = useUpsertSchool();

  // useForm hook to handle the form state and validation
  const form = useForm<SchoolFormValues>({
    // form validation with zodResolver
    resolver: zodResolver(schoolSchema),
    // default values for the form. Use empty strings instead of undefined to keep inputs controlled
    defaultValues: {
      schoolName: school?.schoolName || "",  // first render, school name doesnt exist yet
      schoolAddress: school?.schoolAddress ?? "",
      schoolMotto: school?.schoolMotto ?? "",
      schoolTelephone: school?.schoolTelephone ?? "",
      schoolEmail: school?.schoolEmail ?? "",
    },
  });

  async function onSubmit(data: SchoolFormValues) {
    // detect which fields have been changed
    const { dirtyFields } = form.formState

    try {
      // build the payload for the upsertSchool mutation
      let schoolUpdatePayload: any = {
        schoolName: data.schoolName, // required
      };
      // optional fields are only sent if they are dirty. If they were cleared (empty string/undefined), send null to clear the field in the database. Otherwise, send the value.
      // use || to also set falsey values like "" to null
      if (dirtyFields.schoolAddress !== undefined) {
        schoolUpdatePayload.schoolAddress = (data.schoolAddress?.trim() || null);
      }
      if (dirtyFields.schoolMotto !== undefined) {
        schoolUpdatePayload.schoolMotto = (data.schoolMotto?.trim() || null);
      }
      if (dirtyFields.schoolTelephone !== undefined) {
        schoolUpdatePayload.schoolTelephone = (data.schoolTelephone?.trim() || null);
      }
      if (dirtyFields.schoolEmail !== undefined) {
        // schoolEmail is already transformed to undefined if empty by schema, so ?? null works
        schoolUpdatePayload.schoolEmail = data.schoolEmail ?? null;
      }

      // call the upsertSchool mutation to create or update the school information
      await upsertSchool(schoolUpdatePayload);

      // Success is handled by the mutation's onSuccess callback (cache invalidation)
      // Show success toast
      toast.success("School information saved successfully", {
        description: "Your school details have been saved",
      });

    } catch (err: any) {
      toast.error("Failed to save school information", {
        description: getErrorMessage(err, "An error occurred while saving the school information"),
      });
    }
  }

  // loading state for the submit button - use mutation loading state
  const loading = isMutating || form.formState.isSubmitting;

  return (
    <Card className="border shadow-md">
      <CardContent className="pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* School Information Section */}
            <div className="space-y-4">

              {/* School Information Section subheading (h3) */}
              <div className="pb-2 border-b border-border">
                <h3 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">
                  School Information
                </h3>
              </div>

              {/* School Name */}
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }: { field: ControllerRenderProps<SchoolFormValues, "schoolName"> }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">
                      School Name<span className="text-destructive text-base">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="Enter school name"
                        className="h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
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
                    <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">Address</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="Enter school address or location"
                        className="h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
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
                    <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">Motto</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter your school motto if you want this to appear on the result sheet"
                        className="min-h-20 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* School Telephone and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* School Telephone */}
                <FormField
                  control={form.control}
                  name="schoolTelephone"
                  render={({ field }: { field: ControllerRenderProps<SchoolFormValues, "schoolTelephone"> }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">Telephone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Enter school telephone number"
                          className="h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
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
                      <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter school email address"
                          className="h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit / Discard Buttons */}
            <div className="pt-4 md:pt-6 border-t border-border mt-4 md:mt-6">
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!form.formState.isDirty || loading}
                  onClick={() => form.reset()}
                  className="w-max h-10 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                >
                  Discard Changes
                </Button>
                <LoadingButton
                  type="submit"
                  loading={loading}
                  disabled={!form.formState.isDirty}
                  className="w-max h-10 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
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