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
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export function ResetPasswordForm() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "" },
  });

  async function onSubmit(data) {
    try {
      if (!token) {
        toast.error("Invalid reset token. Please request a new password reset.");
        return;
      }
      const { error } = await authClient.resetPassword({
        newPassword: data.newPassword,
        token,
      });
      if (error) {
        toast.error('Failed to reset password. Please try again.');
        router.push("/forgot-password");
        return;
      }
      toast.success("Password has been reset. You can now sign in.");
      router.push("/sign-in");
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      router.push("/forgot-password");
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

            <LoadingButton type="submit" className="w-full" loading={loading}>
              Reset password
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

