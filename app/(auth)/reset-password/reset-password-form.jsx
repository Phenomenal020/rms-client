"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Card, CardContent } from "@/shadcn/ui/card";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export function ResetPasswordForm({ token }) {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "" },
  });

  async function onSubmit({ newPassword }) {
    setSuccess(null);
    setError(null);

    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    });

    if (error) {
      setError(error.message || "Something went wrong");
    } else {
      setSuccess("Password has been reset. You can now sign in.");
      setTimeout(() => router.push("/sign-in"), 3000);
      form.reset();
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {success && (
              <div role="status" className="text-sm text-green-600">
                {success}
              </div>
            )}
            {error && (
              <div role="alert" className="text-sm text-red-600">
                {error}
              </div>
            )}

            <LoadingButton type="submit" className="w-full" loading={loading}>
              Reset password
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

