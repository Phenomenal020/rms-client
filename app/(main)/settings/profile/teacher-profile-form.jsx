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
import { UserAvatar } from "@/shared-components/user-avatar";
import { authClient } from "@/src/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { updateProfile } from "@/app/api/profile/actions";
import { formatSubscription, formatRole } from "./utils/formatting";

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

// teacher profile form component
export function TeacherProfileForm({ user }) {
  // useRouter hook for navigation
  const router = useRouter();

  // Use firstName and lastName from database 
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  // Get subscription and role (read-only)
  const subscription = user?.subscription || "";
  const role = user?.role || "";
  // Get image. If there is no image, set it to null
  const image = user?.image || null;

  // use the useForm hook to create the form state and validation with default values
  const form = useForm({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      firstName: firstName,
      lastName: lastName,
      subscription: formatSubscription(subscription),
      role: formatRole(role),
      image: image,
    },
  });

  // Handle image file change. TODO: Use Cloudinary or firebase
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        form.setValue("image", base64, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  }

  // Watch the image field for preview when user selects a new image
  const imagePreview = form.watch("image");
  // Get the current image from the user object or the image preview
  const currentImage = imagePreview || user?.image;

  // on submit function - update profile + show toast notifications
  async function onSubmit(data) {
    // try to update the profile
    try {
      // Update firstName and lastName via server action
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      // Call server action to update the profile
      const result = await updateProfile(profileData);

      // Check if the request was successful
      if (result.error) {
        toast.error("Failed to update profile", {
          description: 'Please review the form details and try again',
        });
        return;
      }

      // Update image via authClient (only if image changed and is now not null)
      if (data.image !== undefined && data.image !== null) {
        const { error: userError } = await authClient.updateUser({
          image: data.image,
        });

        if (userError) {
          toast.error("Failed to update profile image", {
            description: "Please review the image and try again",
          });
          return;
        }
      }

      // Success
      toast.success("Profile updated successfully", {
        description: "Your profile information has been saved",
      });
      router.refresh(); // Refresh the page to show updated data
    } catch (err) {
      // if there is an error not covered above, show error toast
      toast.error("Failed to update profile", {
        description:  "An unexpected error occurred",
      });
    }
  }

  // handle loading state when the form is submitting - to disable the submit button and show a loading spinner
  const loading = form.formState.isSubmitting;

  // return the teacher profile form component
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
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Personal Information</h3>
              </div>

              {/* Profile Image Preview and Upload */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar Preview */}
                <div className="relative">
                  <UserAvatar
                    name={`${form.watch("firstName") || ""} ${form.watch("lastName") || ""}`.trim() || user?.name}
                    image={currentImage}
                    className="size-24 border-2 border-gray-200"
                  />
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => form.setValue("image", null)}
                      aria-label="Remove image"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  )}
                </div>

                {/* Image Upload Field */}
                <div className="flex-1 w-full">
                  <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">
                          Profile Image
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e)}
                            className="cursor-pointer"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Upload a profile picture (JPG, PNG, or GIF)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* First Name and Last Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* First Name Field */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your first name"
                          className="transition-colors hover:border-gray-400 focus:border-primary"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your last name"
                          className="transition-colors hover:border-gray-400 focus:border-primary"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Subscription</FormLabel>
                      <FormControl>
                        <Input
                          disabled={true}
                          {...field}
                          placeholder="Subscription"
                          className="transition-colors hover:border-gray-400 focus:border-primary bg-gray-50"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">Role</FormLabel>
                      <FormControl>
                        <Input
                          disabled={true}
                          {...field}
                          placeholder="Role"
                          className="transition-colors hover:border-gray-400 focus:border-primary bg-gray-50"
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