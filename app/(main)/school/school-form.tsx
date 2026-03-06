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
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { useCreateSchool, useUpdateSchool, getErrorMessage } from "@/fetcher/mutations";
import { School } from "@/types/school";  // for the props
import SmallTermText from "@/shared-components/small-term-text";

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

const placeholderSchoolData = schoolSchema.parse({
  schoolName: "Greenfield Academy",
  schoolAddress: "12 Palm Grove Road, Lagos",
  schoolMotto: "Learning Today, Leading Tomorrow",
  schoolTelephone: "+234 800 123 4567",
  schoolEmail: "admin@greenfieldacademy.edu",
});

type SchoolFormProps = {
  school?: School;
};

// School form component
export function SchoolForm({ school }: SchoolFormProps) {

  // Pick the right mutation based on whether the school already exists.
  // school prop is driven by server-fetched data, so this is reliable.
  const isUpdate = !!school;
  const { createSchool, isMutating: isCreating } = useCreateSchool();
  const { updateSchool, isMutating: isUpdating } = useUpdateSchool();
  const isMutating = isCreating || isUpdating;

  // Registration ID — seeded from existing school data, or populated after a successful create
  const [registrationId, setRegistrationId] = useState<string | null>(
    school?.schoolRegistrationId ?? "ZBBC-YHBR-HBFNF-YBRVV"
  );
  const [showRegistrationId, setShowRegistrationId] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!registrationId) return;
    navigator.clipboard.writeText(registrationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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

      // Route to create or update based on whether the school already exists
      if (isUpdate) {
        await updateSchool(schoolUpdatePayload);
      } else {
        const result = await createSchool(schoolUpdatePayload);
        // Surface the registration ID immediately so the admin can copy it
        // without waiting for the SWR cache to refetch
        if (result?.schoolRegistrationId) {
          setRegistrationId(result.schoolRegistrationId);
        }
      }

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
    <>
      {/* Page Header */}
      <section className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          School Management
        </h1>
        <SmallTermText />
      </section>


      <Card className="border shadow-md">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* School Information Section */}
              <section className="space-y-4">

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
                          className="h-12 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
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
                          className="h-12 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
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
                            className="h-12 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
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
                            className="h-12 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* School Registration ID — shown once a school exists */}
              {registrationId && (
                <section className="space-y-2 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm md:text-base text-muted-foreground font-semibold">
                      School Registration ID
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Share this ID with teachers so they can register and join your school.
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      readOnly
                      disabled
                      type={showRegistrationId ? "text" : "password"}
                      value={registrationId}
                      className="h-12 md:h-14 text-sm md:text-base pr-20 font-mono disabled:opacity-100 disabled:cursor-default [&::-ms-reveal]:hidden"
                    />
                    {/* Eye toggle */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowRegistrationId((v) => !v)}
                      title={showRegistrationId ? "Hide registration ID" : "Show registration ID"}
                      aria-label={showRegistrationId ? "Hide registration ID" : "Show registration ID"}
                      className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      {showRegistrationId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {/* Copy to clipboard */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      title="Copy registration ID"
                      aria-label="Copy registration ID"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </section>
              )}

              {/* Submit / Discard Buttons */}
              <div className="pt-4 md:pt-6 border-t border-border mt-4 md:mt-6">
                <div className="flex justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!form.formState.isDirty || loading}
                    onClick={() => form.reset()}
                    className="w-max h-12 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                  >
                    Discard Changes
                  </Button>
                  <LoadingButton
                    type="submit"
                    loading={loading}
                    disabled={!form.formState.isDirty}
                    className="w-max h-12 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                  >
                    Save Changes
                  </LoadingButton>
                </div>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card >
    </>
  );
}