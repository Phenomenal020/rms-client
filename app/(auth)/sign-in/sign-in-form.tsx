"use client";

// Use auth client to interact with the auth server
import { authClient } from '@/src/auth-client';
import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Input } from '@/shadcn/ui/input';
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shadcn/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import { passwordSchema } from '@/src/passwordSchema';
import { EDUCATION_SPEECHES } from "@/shared-components/quotes";

// use zod schema to validate the signin form
const signInSchema = z.object({
  email: z.email({ message: "Please enter a valid email" }),
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});

export function SignInForm() {
  // error state
  const [error, setError] = useState<string | null>(null);

  // Randomise speech index (after mount to avoid hydration mismatch)
  const [speechIndex, setSpeechIndex] = useState(0);
  useEffect(() => {
    setSpeechIndex(Math.floor(Math.random() * EDUCATION_SPEECHES.length));
  }, []);
  const speech = EDUCATION_SPEECHES[speechIndex];

  // search params for the email
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  // router for redirects
  const router = useRouter();

  // use the useForm hook to create the form state and validation
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // when the user submits the form
  async function onSubmit(formData: z.infer<typeof signInSchema>) {
    // on submit, clear the error state
    setError(null);

    // Extract data from the form
    const { email, password, rememberMe } = formData;

    // use the authClient to sign in the user
    const { data, error: signInError } = await authClient.signIn.email(
      { email, password, rememberMe },
      {
        async onSuccess(context) {
          toast.success("Sign in successful");
          // If the user has 2FA enabled, redirect to the verification page
          if (context.data.twoFactorRedirect) {
            router.push(`/verify-2fa?email=${encodeURIComponent(email)}`);
          }
          // if the user's email is not verified, redirect to the verify email page
          else if (!context.data.user?.emailVerified) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          }
          // // If the user has not been onboarded, redirect to the onboarding page
          else if (context.data.user?.onboardingStatus !== "APPROVED") {
            router.push("/onboarding");
          }
          // if there is a redirectTo parameter, redirect to the redirectTo URL
          else if (redirectTo?.startsWith("/") && !redirectTo.startsWith("//")) {
            router.push(redirectTo);
          }
          // finally, redirect to the dashboard (iff those 3 conditions are met)
          else {
            // No 2FA required — go straight to dashboard
            router.push("/dashboard");
          }
        },
      }
    );

    // if there is an error, set the error state and show a toast error message
    if (signInError) {
      toast.error("Unable to sign in. Please check your input and try again.");
    }
  }

  // Track form loading state
  const formLoading = form.formState.isSubmitting;
  const emailValue = form.watch("email").trim();
  const verifyEmailHref = emailValue
    ? `/verify-email?email=${encodeURIComponent(emailValue)}`
    : null;

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

      {/* Right Side - Login Form */}
      <section className="flex flex-col justify-center px-8 py-10 md:w-1/2">
        <div className="mx-auto w-full max-w-sm space-y-8">
          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to continue.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="gap-5">
                {/* Email Field with Icon */}
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

                {/* Password Field with Icon */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field data-invalid={!!fieldState.error}>
                        <div className="flex items-center justify-between gap-2">
                          {/* Password label */}
                          <FieldLabel htmlFor="password">Password</FieldLabel>
                          {/* Forgot password? */}
                          <Link
                            href="/forgot-password"
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          {/* Password input */}
                          <div className="relative">
                            <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <PasswordInput
                              id="password"
                              autoComplete="current-password"
                              placeholder="••••••••"
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
                        ) : 
                        // (
                        //   <FieldDescription>
                        //     ""
                        //   </FieldDescription>
                        // )
                        null
                        }
                      </Field>
                    </FormItem>
                  )}
                />

                {/* Remember Me Checkbox */}
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem>
                      <Field orientation="horizontal">
                        <FieldLabel
                          htmlFor="rememberMe"
                          className="font-normal text-muted-foreground"
                        >
                          <FormControl>
                            <Checkbox
                              id="rememberMe"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          Remember me
                        </FieldLabel>
                      </Field>
                    </FormItem>
                  )}
                />
              </FieldGroup>

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              {/* Login Button and recovery links */}
              <div className="flex flex-col gap-3">
                {/* Sign in Button */}
                <LoadingButton
                  type="submit"
                  className="w-full"
                  loading={formLoading}
                >
                  Sign In
                </LoadingButton>
                {/* Need to verify your email (for signup success but no otp verfication before landing on this page) */}
                <div className="flex justify-end text-xs">
                  {verifyEmailHref ? (
                    <Link
                      href={verifyEmailHref}
                      className="text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Need to verify your email?
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground hover:underline"
                      onClick={() =>
                        toast.error("Enter your email first.")
                      }
                    >
                      Need to verify your email?
                    </button>
                  )}
                </div>
              </div>
            </form>
          </Form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-foreground hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}