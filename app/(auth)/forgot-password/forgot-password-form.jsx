"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { authClient } from "@/src/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

// forgot password schema
const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

export function ForgotPasswordForm() {
  // To conditionally render password reset form or instruction message
  const [passwordSent, setPasswordSent] = useState(false);

  // forgot password form
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // on submit
  async function onSubmit(data) {
    try {
      await authClient.requestPasswordReset(
        {
          email: data.email, // from the input field
          redirectTo: "/reset-password", // redirect to the reset password page (token should be in the url)
        },
        {
          onError: () => {
            toast.info("If this email is associated with an account, a reset email will be sent to your inbox.");  // same response to avoid leaking account information
            setPasswordSent(true);
          },
          onSuccess: () => {
            toast.info("If this email is associated with an account, a reset email will be sent to your inbox.");
            form.reset(); // reset the form
            setPasswordSent(true);
          },
        },
      );
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <>
      {passwordSent ? (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-lg md:text-xl">Check your email</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              If this email is associated with an account, a reset link has been sent.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Please follow the instructions in the email to reset your password.
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <KeyRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg md:text-xl">Forgot password</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <LoadingButton type="submit" className="w-full" loading={loading}>
                  Send reset link
                </LoadingButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </>
  );
}