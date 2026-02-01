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
import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { formatSubscription, formatRole } from "./utils/formatting";
import { useUpdateProfile } from "@/fetcher/mutations";

// For the user prop.
import type { UserData } from "@/types/updateProfile";

// Props interface for TeacherProfileForm
interface TeacherProfileFormProps {
  user: UserData | null;
}

// schema for the teacher profile form: first name, last name, subscription, role, and optional image
const teacherProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Last name is required" }),
  subscription: z
    .string()
    .optional(),
  role: z
    .string()
    .optional(),
  image: z
    .string()
    .optional()
    .nullable(),
});

// Type for form values (inferred from the schema)
type TeacherProfileFormValues = z.infer<typeof teacherProfileSchema>;

// Teacher Profile Form component
export function TeacherProfileForm({ user }: TeacherProfileFormProps) {

  // Mutation hook for updating profile
  const { updateProfile, isMutating, error: updateError } = useUpdateProfile();

  // use the useForm hook to create the form state and validation with default values
  // MUST be called before any conditional returns to follow Rules of Hooks
  const form = useForm({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      subscription: formatSubscription(user?.subscription),
      role: formatRole(user?.role),
    },
  });

  // on submit function - update profile + show toast notifications
  async function onSubmit(data: TeacherProfileFormValues) {
    const updateData = {
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      subscription: undefined,  // ignored by drizzle
      role: undefined,  // ignored by drizzle
    };

    try {
      await updateProfile(updateData);
      toast.success("Profile updated successfully");
      // No need for router.refresh() - SWR automatically refetches after cache invalidation
    } catch (error: any) {
      toast.error("Failed to update profile");
    }
  }

  // handle loading state when the form is submitting - to disable the submit button and show a loading spinner
  const loading = isMutating || form.formState.isSubmitting;

  // return the teacher profile form component (jsx)
  return (
    <Card className="border shadow-md">
      {/* Card Content */}
      <CardContent className="pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Personal Information Section */}
            <div className="space-y-6">

              {/* Personal Information Section subheading */}
              <div className="pb-2 border-b border-gray-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-700 uppercase tracking-wide">Personal Information</h3>
              </div>
              {/* First Name and Last Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* First Name Field */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }: { field: ControllerRenderProps<TeacherProfileFormValues, "firstName"> }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">First Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          placeholder="Enter your first name"
                          className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name Field */}
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }: { field: ControllerRenderProps<TeacherProfileFormValues, "lastName"> }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          placeholder="Enter your last name"
                          className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Subscription and Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Subscription Field */}
                <FormField
                  control={form.control}
                  name="subscription"
                  render={({ field }: { field: ControllerRenderProps<TeacherProfileFormValues, "subscription"> }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Subscription</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={true}
                          {...field}
                          placeholder="Subscription"
                          className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary bg-gray-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role Field */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }: { field: ControllerRenderProps<TeacherProfileFormValues, "role"> }) => (
                    <FormItem>
                      <FormLabel className="text-base text-gray-700 font-semibold">Role</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={true}
                          {...field}
                          placeholder="Role"
                          className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary bg-gray-50"
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
              {/* Submit Button Container */}
              <div className="flex justify-center">
                <LoadingButton
                  type="submit"
                  disabled={!form.formState.isDirty}
                  loading={loading}
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