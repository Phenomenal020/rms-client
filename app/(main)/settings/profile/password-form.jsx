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
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: "Current password is required" }),
  newPassword: passwordSchema,
});


export function PasswordForm() {
  const form = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  async function onSubmit({
    currentPassword,
    newPassword,
  }) {
    // const { error } = await authClient.changePassword({
    //   currentPassword,
    //   newPassword,
    //   revokeOtherSessions: true,  // revoke other sessions (log them out from other devices)
    // });

    // if (error) {
    //   toast.error(error.message || "Failed to change password");
    // } else {
    //   toast.success("Password changed");
    //   form.reset();
    // }
    toast.info("Password change is not implemented yet");
  }

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
            {/* OAuth users (without a password) can use the "forgot password" flow */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="Enter current password"
                      className="transition-colors hover:border-gray-400 focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="Enter new password"
                      className="transition-colors hover:border-gray-400 focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Changing your password will log you out from all other devices for security.
                  </p>
                </FormItem>
              )}
            />

            <div className="pt-2">
              <LoadingButton
                type="submit"
                loading={loading}
                className="w-full h-10 font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
              >
                Change Password
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
