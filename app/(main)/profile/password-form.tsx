"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { authClient } from "@/src/auth-client";
import { passwordSchema } from "@/src/passwordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type ControllerRenderProps, type Control } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";

// Props interface for PasswordForm
interface PasswordFormProps {
  hasPasswordAccount: boolean;
}
// password change form component
export function PasswordForm({ hasPasswordAccount }: PasswordFormProps) {

  // Update password schema
  const updatePasswordSchema = z.object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: passwordSchema,
  });
  // Type for form values
  type PasswordFormValues = z.infer<typeof updatePasswordSchema>;

  // useform hook for the password change form
  const form = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" }
  });

  // state for the password change form: allowPasswordChange is false by default (so the password input is disabled)
  const [allowPasswordChange, setAllowPasswordChange] = useState(false);

  // on submit the password change form, send the current password and the new password to the server and reset the form
  async function onSubmit(data: PasswordFormValues) {
    if (!allowPasswordChange) {
      toast.error("You are not allowed to change your password");
      return;
    }

    try {
      // get the current password and the new password from the form data
      const { currentPassword, newPassword } = data as { currentPassword: string; newPassword: string };

      // if the current password is not provided, show an error and reset the form
      if (!currentPassword) {
        toast.error("Current password is required");
        form.reset()
        form.clearErrors();
        return;
      }

      // Otherwise, Call BA's changePassword method to update the password
      await authClient.changePassword(
        {
          currentPassword,
          newPassword,
          revokeOtherSessions: true,  // log the user out from all other devices for security
        },
        {
          onError: (error: unknown) => {
            toast.error("Failed to change password");  // vague error message
          },
          onSuccess: async () => {
            toast.success("Password successfully changed");
            setAllowPasswordChange(false);
            form.reset();
            await authClient.signOut();  // log the user out from the current device
          },
        }
      );
    } catch (error) {
      toast.error("Failed to change password");  // Handle any other errors
    }
  }

  // handle change password button click - toggles allowPasswordChange
  function handleChangePasswordClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    // When cancelling, reset form values and clear any validation errors
    if (allowPasswordChange) {
      form.reset();
      form.clearErrors();
    }
    setAllowPasswordChange(!allowPasswordChange);
  }

  // set loading to true when the form is submitting (disables the change password button and shows a loading spinner)
  const loading = form.formState.isSubmitting;

  return (
    <>


      <Card className="border shadow-md">

        {/* Card Content */}
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="pb-2 border-b border-border">
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">Password</h3>
              </div>

              {/* Password Section */}
              <div className="space-y-3">
                {/* Current Password Field - Only show if user has a password account and editing is enabled */}
                {hasPasswordAccount && (
                  // if the user has a password account, show the current password field
                  <FormField
                    control={form.control as Control<{ currentPassword: string; newPassword: string }>}
                    name="currentPassword"
                    render={({ field }: { field: ControllerRenderProps<{ currentPassword: string; newPassword: string }, "currentPassword"> }) => (

                      // current password field
                      <FormItem>
                        <FormLabel className="text-sm text-muted-foreground font-semibold">Current Password</FormLabel>
                        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
                          {/* Current Password Input */}
                          <div className="flex-1">
                            <FormControl>
                              <PasswordInput
                                {...field}
                                placeholder="Enter current password"
                                className="w-full h-12 md:h-14 text-sm transition-colors hover:border-input focus:border-primary bg-muted"
                                disabled={!allowPasswordChange}
                              />
                            </FormControl>
                          </div>

                          {/* if the user is not allowed to change the password, show the change password button */}
                          {!allowPasswordChange ? (
                            <LoadingButton
                              type="button"
                              onClick={handleChangePasswordClick}
                              loading={false}
                              disabled={false}
                              className="h-12 md:h-14 text-sm font-medium shadow-sm hover:shadow transition-shadow cursor-pointer whitespace-nowrap w-full sm:w-auto"
                            >
                              Change Password
                            </LoadingButton>
                          ) : (
                            // if the user is allowed to change the password, show the cancel button
                            <LoadingButton
                              type="button"
                              onClick={handleChangePasswordClick}
                              loading={false}
                              disabled={false}
                              className="h-10 md:h-14 text-sm font-medium shadow-sm hover:shadow transition-shadow cursor-pointer whitespace-nowrap w-full sm:w-auto"
                            >
                              Cancel
                            </LoadingButton>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* New Password Field - Only show when editing is enabled */}
                {allowPasswordChange && (
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }: { field: ControllerRenderProps<PasswordFormValues, "newPassword"> }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-muted-foreground font-semibold">
                          {hasPasswordAccount ? "New Password" : "Password"}
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            {...field}
                            placeholder={hasPasswordAccount ? "Enter new password" : "Enter password"}
                            className="w-full h-12 md:h-14 text-sm transition-colors hover:border-input focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-sm font-bold mt-1 text-muted-foreground">
                          {hasPasswordAccount
                            ? "Changing your password will log you out from all other devices for security."
                            : "Setting a password will log you out from all other devices for security."}
                        </p>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Submit Button - Only show when editing is enabled */}
              {allowPasswordChange && (
                <div className="pt-4 md:pt-6 border-t border-border mt-4 md:mt-6">
                  <div className="flex justify-center">
                    <LoadingButton
                      type="submit"
                      loading={loading}
                      disabled={!allowPasswordChange}
                      className="w-full sm:w-auto min-w-[160px] h-10 md:h-14 text-sm font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                    >
                      {hasPasswordAccount ? "Change Password" : "Set Password"}
                    </LoadingButton>
                  </div>
                </div>
              )}

            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}