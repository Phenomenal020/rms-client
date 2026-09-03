// reset-password/reset-password-form.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shadcn/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shadcn/ui/input-otp";
import { authClient } from "@/src/auth-client";
import { passwordSchema } from "@/src/passwordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ChevronLeft, Lock } from "lucide-react";
import { EDUCATION_SPEECHES } from "@/shared-components/quotes";

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

  // Randomise speech index (after mount to avoid hydration mismatch)
  const [speechIndex, setSpeechIndex] = useState(0);
  useEffect(() => {
    setSpeechIndex(Math.floor(Math.random() * EDUCATION_SPEECHES.length));
  }, []);
  const speech = EDUCATION_SPEECHES[speechIndex];

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
    <div className="flex w-full max-w-4xl flex-col-reverse overflow-hidden rounded-lg border border-border bg-card md:min-h-[560px] md:flex-row-reverse">

      {/* Right Side - Education quotes */}
      <section className="flex flex-col justify-between gap-10 bg-neutral-950 px-8 py-10 text-neutral-100 md:w-1/2 md:border-l md:border-neutral-800">
        {/* Brand text*/}
        <h2 className="text-2xl font-semibold tracking-tight">
          {process.env.NEXT_PUBLIC_BRAND}
        </h2>
        {/* Education quote */}
        <figure className="flex flex-col gap-4">
          <blockquote className="border-l border-neutral-700 pl-4">
            <p key={speechIndex} className="text-lg leading-relaxed text-neutral-200">
              &ldquo;{speech.quote}&rdquo;
            </p>
          </blockquote>
          <figcaption
            key={`${speechIndex}-author`}
            className="text-sm text-neutral-500"
          >
            — {speech.author}
          </figcaption>
        </figure>
        {/* Copyright notice */}
        <p className="text-xs text-neutral-600">
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
          {process.env.NEXT_PUBLIC_BRAND} Inc. All rights reserved.
        </p>
      </section>

      {/* Left Side - Reset Password Form */}
      <section className="flex flex-col justify-center px-8 py-10 md:w-1/2">
        <div className="mx-auto w-full max-w-sm space-y-8">
          {/* Back — previous step in the reset flow */}
          <Link
            href="/forgot-password"
            replace
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Back
          </Link>

          {/* Title and Description */}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Reset password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your reset code and choose a new password.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="gap-5">

                {/* OTP Field */}
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="otp">Reset code</FieldLabel>
                        <FieldDescription>
                          Enter the 6-digit code sent to{" "}
                          <span className="font-medium text-foreground">{email}</span>.
                        </FieldDescription>
                        <FormControl className="w-full">
                          <InputOTP
                            id="otp"
                            maxLength={6}
                            {...field}
                            disabled={formLoading || attemptsExhausted || isResending}
                            className="w-full"
                          >
                            <InputOTPGroup className="w-full gap-2">
                              <InputOTPSlot index={0} className="h-11 flex-1" />
                              <InputOTPSlot index={1} className="h-11 flex-1" />
                              <InputOTPSlot index={2} className="h-11 flex-1" />
                              <InputOTPSlot index={3} className="h-11 flex-1" />
                              <InputOTPSlot index={4} className="h-11 flex-1" />
                              <InputOTPSlot index={5} className="h-11 flex-1" />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FieldError>
                          <FormMessage />
                        </FieldError>
                      </Field>
                    </FormItem>
                  )}
                />

                {/* New Password */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <PasswordInput
                              id="newPassword"
                              autoComplete="new-password"
                              placeholder="••••••••"
                              disabled={attemptsExhausted}
                              className="pl-9 text-sm font-normal"
                              aria-invalid={!!fieldState.error}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        {fieldState.error ? (
                          <FieldError>
                            <FormMessage />
                          </FieldError>
                        ) : (
                          <FieldDescription>
                            At least 8 characters with one special character.
                          </FieldDescription>
                        )}
                      </Field>
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <PasswordInput
                              id="confirmPassword"
                              autoComplete="new-password"
                              placeholder="••••••••"
                              disabled={attemptsExhausted}
                              className="pl-9 text-sm font-normal"
                              aria-invalid={!!fieldState.error}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FieldError>
                          <FormMessage />
                        </FieldError>
                      </Field>
                    </FormItem>
                  )}
                />
              </FieldGroup>

              {/* Reset Password Button */}
              <LoadingButton
                type="submit"
                className="w-full"
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
                  className="h-auto p-0 font-medium text-foreground hover:underline disabled:opacity-50"
                  loading={isResending}
                  disabled={resendCooldown > 0}
                  onClick={handleResend}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                </LoadingButton>
              </div>

            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
