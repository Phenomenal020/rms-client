// forgot-password/forgot-password-form.tsx
"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shadcn/ui/field";
import { authClient } from "@/src/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, ChevronLeft } from "lucide-react";
import { EDUCATION_SPEECHES } from "@/shared-components/quotes";

// forgot password schema
const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email" }),
});
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  // for navigation
  const router = useRouter();

  // Randomise speech index (after mount to avoid hydration mismatch)
  const [speechIndex, setSpeechIndex] = useState(0);
  useEffect(() => {
    setSpeechIndex(Math.floor(Math.random() * EDUCATION_SPEECHES.length));
  }, []);
  const speech = EDUCATION_SPEECHES[speechIndex];

  // form: validation and default values
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // on submit: send reset code
  async function onSubmit(formData: ForgotPasswordFormData) {
    // Always fire the request but never reveal whether the email is registered.
    const { error: requestPasswordResetError } = await authClient.emailOtp.sendVerificationOtp({
      type: "forget-password",
      email: formData.email,
    });
    if (requestPasswordResetError) {
      toast.error("Unable to send reset code. Please check your email and try again.");
      return;
    }
    toast.success("If your email is registered, you'll receive a reset code shortly.");
    router.push(`/reset-password?email=${encodeURIComponent(formData.email || "")}`);
  }

  const loading = form.formState.isSubmitting;

  return (
    <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-card md:min-h-[560px] md:flex-row">

      {/* Left Side - Education quotes */}
      <section className="flex flex-col justify-between gap-10 bg-neutral-950 px-8 py-10 text-neutral-100 md:w-1/2 md:border-r md:border-neutral-800">
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

      {/* Right Side - Forgot Password Form */}
      <section className="flex flex-col justify-center px-8 py-10 md:w-1/2">
        <div className="mx-auto w-full max-w-sm space-y-8">
          {/* Back — same idea as verify-email (to sign-in) */}
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Back
          </Link>

          {/* Title and Description */}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Forgot password?</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset code.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="gap-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@school.edu"
                              className="pl-9 text-sm font-normal"
                              autoComplete="email"
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

              <LoadingButton type="submit" className="w-full" loading={loading}>
                Send Reset Code
              </LoadingButton>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
