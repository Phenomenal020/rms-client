// reset-password/reset-password-form.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Button } from "@/shadcn/ui/button";
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
import { ChevronLeft } from "lucide-react";

// Keep in sync with emailOTP.allowedAttempts / expiresIn in auth-setup.ts
const MAX_OTP_ATTEMPTS = 2;
const OTP_EXPIRES_MINUTES = 5;

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

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// reset password component
export function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter();

  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const attemptsExhausted = failedAttempts >= MAX_OTP_ATTEMPTS;

  // Clear cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    };
  }, []);

  // Code was just sent from forgot-password — start cooldown so Resend isn't immediate
  useEffect(() => {
    startCooldown();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, []);

  function startCooldown() {
    setResendCooldown(60);
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
    }
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(formData: ResetPasswordFormData) {
    if (attemptsExhausted) {
      toast.error("Too many attempts for this code. Request a new one.");
      return;
    }

    const { error: resetPasswordError } = await authClient.emailOtp.resetPassword({
      email,
      otp: formData.otp,
      password: formData.newPassword,
    });

    if (resetPasswordError) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      form.setValue("otp", "");

      if (nextFailed >= MAX_OTP_ATTEMPTS) {
        toast.error("Too many attempts. Request a new reset code.");
      } else {
        const remaining = MAX_OTP_ATTEMPTS - nextFailed;
        toast.error(
          `Invalid or expired code. ${remaining} attempt${remaining === 1 ? "" : "s"} left`,
        );
      }
      return;
    }

    toast.success("Password reset successfully. Please sign in.");
    router.push("/sign-in");
  }

  // handle resend reset code
  async function handleResend() {
    setIsResending(true);

    const { error: sendVerificationOtpError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "forget-password",
    });

    setIsResending(false);

    if (sendVerificationOtpError) {
      toast.error("Unable to send reset code. Please try again later.");
      return;
    }
    // reset failed attempts and start cooldown
    setFailedAttempts(0);
    startCooldown();
    toast.success("A new reset code has been sent.");
    // reset OTP field
    form.setValue("otp", "");
  }

  // form loading state
  const formLoading = form.formState.isSubmitting;

  return (
    <>
      {/* Back — previous step in the reset flow */}
      <div className="absolute top-4 left-0 z-10">
        <Button
          variant="link"
          size="sm"
          className="gap-1.5 cursor-pointer"
          onClick={() => router.replace("/forgot-password")}
        >
          <ChevronLeft className="h-8 w-8" />
          Back
        </Button>
      </div>

      {/* Title and Description */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="text-muted-foreground">
          Enter your reset code and choose a new password.
        </p>
      </div>

      <Card className="relative mx-auto w-full max-w-md">


        <CardContent className="pt-12">
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
                      <span className="font-medium">{email}</span>.
                    </p>
                    <FormControl className="w-full">
                      <InputOTP
                        maxLength={6}
                        {...field}
                        disabled={formLoading || attemptsExhausted || isResending}
                        className="w-full"
                      >
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
                        disabled={attemptsExhausted}
                        className="h-14"
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
                        disabled={attemptsExhausted}
                        className="h-14"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reset Password Button */}
              <LoadingButton
                type="submit"
                className="w-full h-10 md:h-12 rounded-sm"
                loading={formLoading}
                disabled={attemptsExhausted || isResending}
              >
                Reset Password
              </LoadingButton>

              {/* Resend Reset Code Button */}
              <div className="text-center text-sm text-muted-foreground">
                {attemptsExhausted
                  ? "This code can no longer be used. "
                  : "Didn't receive a code? "}
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
    </>
  );
}
