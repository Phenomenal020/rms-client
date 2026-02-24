"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Button } from "@/shadcn/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { authClient } from "@/src/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { passwordSchema } from "@/src/passwordSchema";
import { Mail, Key, User } from "lucide-react";
import Image from "next/image";

// use zod schema to validate the signup form
const signUpSchema = z
  .object({
    // name: z.string().min(1, { message: "Name is required" }),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.email({ message: "Please enter a valid email" }),
    password: passwordSchema,
    passwordConfirmation: z
      .string()
      .min(1, { message: "Please confirm password" }),
  })
  // use.refine for cross-field validation (password and password confirmation)
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

// sign up form component
export function SignUpForm() {
  const [error, setError] = useState(null);

  // useRouter hook for navigation
  const router = useRouter();

  // use the useForm hook to create the form state and validation
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      // name: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  // when the user submits the form
  async function onSubmit(data) {
    setError(null);
    const { email, password, firstName, lastName } = data;
    
    // use the authClient (b/c this is a client component) to sign up the user
    const { error } = await authClient.signUp.email({
      email,
      password,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      callbackURL: "/settings/profile", // Redirect here AFTER user clicks verification link in email
    });

    if (error) {
      const errorMessage = "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } else {  // if there is no error, then the user is signed up successfully
      toast.success("Sign up successful! Please sign in to continue to your account.");
      router.push("/sign-in");
    }
  }

  // Handle social sign in
  async function handleSocialSignIn(provider) {
    setError(null);
    // Social sign up can be implemented later
    toast.info(`${provider} sign up coming soon`);
  }

  const loading = form.formState.isSubmitting;

  return (
    <div className="flex h-screen min-h-[800px] w-full max-w-[1280px] overflow-y-auto mx-auto">

      {/* Left Side - Image with Quote */}
      <div className="hidden lg:flex w-[60%] h-full bg-muted items-center justify-center">
        {/* Quote Overlay */}
        <div className="flex flex-col items-center justify-center px-8 md:px-16 w-full h-full my-auto">
          {/* Quote at top */}
          <div className="space-y-2">
            <p className="text-lg sm:text-xl lg:text-2xl font-light text-foreground leading-relaxed mt-12 text-center">
              The future belongs to those who{" "}
              <span className="text-primary font-semibold">believe</span>{" "}
              in the{" "}
              <span className="text-primary font-semibold">beauty of their dreams.</span>
            </p>
            <p className="text-lg text-muted-foreground italic text-right">
              - Eleanor Roosevelt
            </p>
          </div>

          {/* Image taking remaining space */}
          <div className="flex-1 flex items-center justify-center w-full min-h-[400px] overflow-hidden relative">
            <Image 
              src="/Sign up-amico.svg" 
              alt="Sign Up Image" 
              fill={true}
              className="w-full h-full max-w-full max-h-full object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-[40%] h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 py-8 md:py-0 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-left">Sign Up</h1>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name Field with Icon */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="First name"
                          className="h-14 pl-12 pr-4 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name Field with Icon */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Last name"
                          className="h-14 pl-12 pr-4 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field with Icon */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Your email"
                          className="h-14 pl-12 pr-4 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field with Icon */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <PasswordInput
                          autoComplete="new-password"
                          placeholder="Password"
                          className="h-14 pl-12 pr-12 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field with Icon */}
              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <PasswordInput
                          autoComplete="new-password"
                          placeholder="Confirm password"
                          className="h-14 pl-12 pr-12 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              {/* Sign Up Button */}
              <div className="flex flex-col gap-2">
                <LoadingButton
                  type="submit"
                  className="w-full h-14 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
                  loading={loading}
                >
                  Create Account
                </LoadingButton>
              </div>

              {/* Divider with "or" */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-base">
                  <span className="bg-background px-4 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>

              {/* Social Sign In Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-14 rounded-sm border-border hover:bg-muted gap-2 text-base font-semibold text-muted-foreground cursor-pointer"
                  disabled={loading}
                  onClick={() => handleSocialSignIn("google")}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-14 rounded-sm border-border hover:bg-muted gap-2 text-base font-semibold text-muted-foreground cursor-pointer"
                  disabled={true}
                  onClick={() => handleSocialSignIn("facebook")}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </form>
          </Form>

          {/* Sign In Link */}
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}