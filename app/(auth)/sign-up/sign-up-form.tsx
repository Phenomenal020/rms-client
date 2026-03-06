"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { authClient } from "@/src/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { passwordSchema } from "@/src/passwordSchema";
import { Mail, Key, User } from "lucide-react";
import Image from "next/image";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

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
  async function onSubmit(data: SignUpFormData) {
    // Extract data from the form
    const { email, password, firstName, lastName } = data;

    // use the authClient to sign up the user
    const { error } = await authClient.signUp.email({
      email,
      password,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
    });

    // Handle error 
    if (error) {
      const errorMessage = "Something went wrong. Please try again.";
      // setError(errorMessage);
      toast.error(errorMessage);
    } else {  // if there is no error, then the user has signed up successfully
      // Send OTP to the email after successful signup
      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (otpError) {
        toast.error("Failed to send verification code. Please try again.");
        return;
      }
      // Inform them that a verification code has been sent to their email
      toast.success("Please check your email for a verification code to continue.");
      // Pass email via query param so the OTP page knows who to verify
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
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