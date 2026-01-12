"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { authClient } from "@/src/lib/auth-client";
import { passwordSchema } from "@/src/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";

// password change form component
export function PasswordForm({ hasPasswordAccount }) {

  // Dynamic schema based on whether user has a password account
  // If hasPasswordAccount is true, currentPassword is required
  // If false, currentPassword is not needed (using oath)
  const updatePasswordSchema = hasPasswordAccount
    ? z.object({
        currentPassword: z
          .string()
          .min(1, { message: "Current password is required" }),
        newPassword: passwordSchema,
      })  // schema for a user that logged in with a password
    : z.object({
        newPassword: passwordSchema,
      }); // schema for a user that logged in with OAuth

  // useform hook for the password change form
  const form = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  // state for the password change form: allowPasswordChange is false by default (so the password input is disabled)
  const [allowPasswordChange, setAllowPasswordChange] = useState(false);

  // on submit the password change form, send the current password and the new password to the server and reset the form
  async function onSubmit({
    currentPassword,
    newPassword,
  }) {

    if (!allowPasswordChange) {
      toast.error("You are not allowed to change your password");
      return;
    }

    try {
      // If user doesn't have a password account, use setPassword (no current password required)
      if (!hasPasswordAccount) {
        // TODO: Verify ouath flow
        // await authClient.requestPasswordReset({
        //   email: user.email,
        //   redirectTo: "/reset-password",
        // },
          // {
          //   password: newPassword,
          //   revokeOtherSessions: true,
          // },
          // {
          //   onError: (error) => {
          //     toast.error("Failed to set password");
          //   },
          //   onSuccess: () => {
          //     toast.success("Password successfully set");
          //     form.reset();
          //     setAllowPasswordChange(false);
          //   },
          // }
        // );
        toast.info("Password change request for oauth users is not implemented yet");
      } else {
        // User has password account, use changePassword (requires current password)
        if (!currentPassword) {
          toast.error("Current password is required");
          return;
        }
        await authClient.changePassword(
          {
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
          },
          {
            onError: (error) => {
              toast.error("Failed to change password");
            },
            onSuccess: () => {
              toast.success("Password successfully changed");
              // TODO: password changes but user is not logged out
              form.reset();
              setAllowPasswordChange(false);
            },
          }
        );
      }
    } catch (error) {
      toast.error(hasPasswordAccount ? "Failed to change password" : "Failed to set password");
    }
  }

  // handle change password button click - toggles allowPasswordChange
  function handleChangePasswordClick(e) {
    e.preventDefault();
    setAllowPasswordChange(!allowPasswordChange);
  }

  // set loading to true when the form is submitting (disables the change password button and shows a loading spinner)
  const loading = form.formState.isSubmitting;

  return (
    <Card className="border shadow-md h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Current Password Field - Only show if user has a password account and editing is enabled */}
            {hasPasswordAccount && (
              // if the user has a password account, show the current password field
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  // current password field
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Current Password</FormLabel>
                    <div className="flex gap-3 mt-2">
                      <FormControl>
                        <PasswordInput
                          {...field}
                          placeholder="Enter current password"
                          className="flex-1 transition-colors hover:border-gray-400 focus:border-primary bg-gray-50"
                          disabled={!allowPasswordChange}
                        />
                      </FormControl>

                      {/* if the user is not allowed to change the password, show the change password button */}
                      {!allowPasswordChange ? (
                        <LoadingButton
                          type="button"
                          onClick={handleChangePasswordClick}
                          className="h-10 font-medium shadow-sm hover:shadow transition-shadow cursor-pointer whitespace-nowrap"
                        >
                          Change Password
                        </LoadingButton>
                      ) : (
                        // if the user is allowed to change the password, show the cancel button
                        <LoadingButton
                          type="button"
                          onClick={handleChangePasswordClick}
                          className="h-10 font-medium shadow-sm hover:shadow transition-shadow cursor-pointer whitespace-nowrap"
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

            {/* For OAuth users without password, show a button to set password */}
            {!hasPasswordAccount && !allowPasswordChange && (
              <div>
                <FormLabel className="text-gray-700 font-semibold">Password</FormLabel>
                <div className="mt-2">
                  <LoadingButton
                    type="button"
                    onClick={handleChangePasswordClick}
                    className="h-10 font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                  >
                    Set Password
                  </LoadingButton>
                </div>
              </div>
            )}


            {/* New Password Field - Only show when editing is enabled */}
            {allowPasswordChange && (
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">
                      {hasPasswordAccount ? "New Password" : "Password"}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder={hasPasswordAccount ? "Enter new password" : "Enter password"}
                        className="transition-colors hover:border-gray-400 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      {hasPasswordAccount 
                        ? "Changing your password will log you out from all other devices for security."
                        : "Setting a password will log you out from all other devices for security."}
                    </p>
                  </FormItem>
                )}
              />
            )}

            {/* Submit Button - Only show when editing is enabled */}
            {allowPasswordChange && (
              <div className="pt-2">
                <LoadingButton
                  type="submit"
                  loading={loading}
                  disabled={!allowPasswordChange}
                  className="w-full h-10 font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                >
                  {hasPasswordAccount ? "Change Password" : "Set Password"}
                </LoadingButton>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
