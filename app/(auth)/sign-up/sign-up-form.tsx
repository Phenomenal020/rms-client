"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { Input } from "@/shadcn/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from "@/shadcn/ui/field";
import { authClient } from "@/src/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { passwordSchema } from "@/src/passwordSchema";
import { Mail, Lock, User } from "lucide-react";
import { EDUCATION_SPEECHES } from "@/shared-components/quotes";

// use zod schema to validate the signup form
const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, { message: "First name is required" }),
    lastName: z.string().trim().min(1, { message: "Last name is required" }),
    email: z.email({ message: "Please enter a valid email" }),
    password: passwordSchema,
    passwordConfirmation: z.string().trim().min(1, { message: "Please confirm password" }),
    signUpRole: z.enum(["SCHOOL_ADMIN", "TEACHER"]).default("TEACHER")
  })
  // use.refine for cross-field validation (password and password confirmation)
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });
// Infer the type of the sign up form data from the sign up schema
type SignUpFormData = z.infer<typeof signUpSchema>;

// sign up form component
export function SignUpForm() {
  // useRouter hook for navigation
  const router = useRouter();

  // Randomise speech index (after mount to avoid hydration mismatch)
  const [speechIndex, setSpeechIndex] = useState(0);
  useEffect(() => {
    setSpeechIndex(Math.floor(Math.random() * EDUCATION_SPEECHES.length));
  }, []);
  const speech = EDUCATION_SPEECHES[speechIndex];

  // use the useForm hook to create the form state and validation
  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema), // specify a resolver
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      signUpRole: "TEACHER",   // default role is teacher
    },  // set default values for the form
  });

  // when the user submits the form
  async function onSubmit(formData: SignUpFormData) {
    // Extract data from the form
    const { email, password, firstName, lastName, signUpRole } = formData;

    // use the authClient to sign up the user
    const { error: signUpError } = await authClient.signUp.email({
      email, password, firstName, lastName,
      name: `${firstName} ${lastName}`,
      signUpRole: signUpRole as "SCHOOL_ADMIN" | "TEACHER"
    });
    if (signUpError) {
      // Intentionally vague — do not reveal whether the email is already registered
      toast.error("Something went wrong. Please check your details and try again.");
      return;
    } else {
      // Intentionally vague — same message regardless of account state
      toast.success("Check your email for a verification code to complete the sign up.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  }

  // Track form loading state
  const formLoading = signUpForm.formState.isSubmitting;

  return (
    <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-card md:min-h-[560px] md:flex-row">

      {/* Left Side - Education quotes */}
      <section className="flex flex-col justify-between gap-10 bg-neutral-950 px-8 py-10 text-neutral-100 md:w-1/2 md:border-r md:border-neutral-800">
        {/* Brand text*/}
        <h2 className="text-2xl font-semibold tracking-tight">{process.env.NEXT_PUBLIC_BRAND}</h2>
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

      {/* Right Side - Sign Up Form */}
      <section className="flex flex-col justify-center px-8 py-10 md:w-1/2">
        <div className="mx-auto w-full max-w-sm space-y-8">
          {/* Title */}
          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight">Sign up</h3>
            <p className="text-sm text-muted-foreground">
              Create your account to get started.
            </p>
          </div>

          {/* Form */}
          <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="gap-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name Field with Icon */}
                  <FormField
                    control={signUpForm.control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel htmlFor="firstName">First name</FieldLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                              <Input
                                id="firstName"
                                type="text"
                                placeholder="First name"
                                className="pl-9 text-sm font-normal"
                                autoComplete="given-name"
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

                  {/* Last Name Field with Icon */}
                  <FormField
                    control={signUpForm.control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                              <Input
                                id="lastName"
                                type="text"
                                placeholder="Last name"
                                className="pl-9 text-sm font-normal"
                                autoComplete="family-name"
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
                </div>

                {/* Email Field with Icon */}
                <FormField
                  control={signUpForm.control}
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
                  control={signUpForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <PasswordInput
                              id="password"
                              autoComplete="new-password"
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
                        ) : (
                          <FieldDescription>
                            At least 8 characters with one special character.
                          </FieldDescription>
                        )}
                      </Field>
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field with Icon */}
                <FormField
                  control={signUpForm.control}
                  name="passwordConfirmation"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="passwordConfirmation">Confirm password</FieldLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <PasswordInput
                              id="passwordConfirmation"
                              autoComplete="new-password"
                              placeholder="••••••••"
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

                {/* Role Field with Icon */}
                <FormField
                  control={signUpForm.control}
                  name="signUpRole"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="signUpRole">Sign up as</FieldLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="signUpRole" className="w-full text-sm font-normal">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SCHOOL_ADMIN">Admin</SelectItem>
                              <SelectItem value="TEACHER">Teacher</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FieldError>
                          <FormMessage />
                        </FieldError>
                      </Field>
                    </FormItem>
                  )}
                />
              </FieldGroup>

              {/* Sign Up Button */}
              <div className="flex flex-col gap-2">
                <LoadingButton
                  type="submit"
                  className="w-full"
                  loading={formLoading}
                >
                  Create Account
                </LoadingButton>
              </div>
            </form>
          </Form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-foreground hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}