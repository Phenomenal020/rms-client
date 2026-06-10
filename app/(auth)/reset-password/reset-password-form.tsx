// reset-password/reset-password-form.tsx
"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shadcn/ui/input-otp";
import { authClient } from "@/src/auth-client";
import { passwordSchema } from "@/src/passwordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState, useRef } from "react";

// schema for reset password
const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, { message: "Please enter the full 6-digit code" }),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// reset password component
export function ResetPasswordForm({ email }: { email: string }) {
  // router for redirects
  const router = useRouter();

  // loading state for the submit button
  const [loading, setLoading] = useState(false);

  // Resend cooldown: tracks remaining seconds; 0 means the button is available
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown() {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // form: validation and default values
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(formData: z.infer<typeof resetPasswordSchema>) {
    // Set loading state to true
    setLoading(true);

    const { error: resetPasswordError } = await authClient.emailOtp.resetPassword({
      email,
      otp: formData.otp,
      password: formData.newPassword,
    });

    // Set loading state to false
    setLoading(false);

    if (resetPasswordError) {
      toast.error("Invalid or expired code. Please check your code and try again.");
      return;
    }

    // Show success toast and redirect to sign in page
    toast.success("Password reset successfully. Please sign in.");
    router.push("/sign-in");
  }

  async function handleResend() {
    setIsResending(true);

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "forget-password",
    });

    setIsResending(false);

    if (error) {
      toast.success("If your email is registered, you'll receive a reset code shortly.");
      return;
    }

    startCooldown();
    toast.success("A new reset code has been sent.");
    form.setValue("otp", "");
  }

  const formLoading = form.formState.isSubmitting;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* OTP Field */}
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset code</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                  <FormControl className="w-full">
                    <InputOTP maxLength={6} {...field} className="w-full">
                      <InputOTPGroup className="w-full gap-2">
                        <InputOTPSlot index={0} className="flex-1 h-12" />
                        <InputOTPSlot index={1} className="flex-1 h-12" />
                        <InputOTPSlot index={2} className="flex-1 h-12" />
                        <InputOTPSlot index={3} className="flex-1 h-12" />
                        <InputOTPSlot index={4} className="flex-1 h-12" />
                        <InputOTPSlot index={5} className="flex-1 h-12" />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
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

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              className="w-full h-10 md:h-12 rounded-sm"
              loading={formLoading || loading}
            >
              Reset Password
            </LoadingButton>

            {/* Resend */}
            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive a code?{" "}
              <LoadingButton
                type="button"
                variant="link"
                className="p-0 h-auto font-semibold text-primary disabled:opacity-50"
                loading={isResending}
                disabled={resendCooldown > 0}
                onClick={handleResend}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
              </LoadingButton>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
