"use client";

import { LoadingButton } from "@/shared-components/loading-button";
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
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";

// forgot password schema
const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

export function ForgotPasswordForm() {
  // To conditionally render password reset form or instruction message
  const [passwordSent, setPasswordSent] = useState(false);
  const [error, setError] = useState(null);

  // forgot password form
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // on submit
  async function onSubmit(data) {
    setError(null);
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
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <div className="flex h-screen min-h-[600px] w-full max-w-[1280px] overflow-y-auto mx-auto">

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
              src="/forgot-password-rmbg.gif" 
              alt="Forgot Password Image" 
              fill={true}
              className="w-full h-full max-w-full max-h-full object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-[40%] h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 py-8 md:py-0 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Title */}
          {!passwordSent && <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">Forgot Password</h1>}

          {passwordSent ? (
            /* Success Message */
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-lg md:text-xl font-semibold text-foreground">Check your email</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  If this email is associated with an account, a reset link has been sent.
                </p>
              </div>
              <div className="text-center text-sm md:text-base text-muted-foreground">
                Please follow the instructions in the email to reset your password.
              </div>
              <Link
                href="/sign-in"
                className="block text-center text-sm md:text-base font-semibold text-primary hover:underline cursor-pointer"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            /* Form */
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                {/* Error Message */}
                {error && (
                  <div
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}

                {/* Send Reset Link Button */}
                <div className="flex flex-col gap-2">
                  <LoadingButton
                    type="submit"
                    className="w-full h-14 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
                    loading={loading}
                  >
                    Send Reset Link
                  </LoadingButton>
                </div>
              </form>
            </Form>
          )}

          {/* Sign In Link */}
          {!passwordSent && (
            <div className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/sign-in"
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}