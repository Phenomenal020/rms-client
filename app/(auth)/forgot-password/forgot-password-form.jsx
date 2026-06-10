// forgot-password/forgot-password-form.tsx
"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { authClient } from "@/src/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Mail } from "lucide-react";

// forgot password schema
const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email" }),
});

export function ForgotPasswordForm() {
  // for navigation
  const router = useRouter();

  // form: validation and default values
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // on submit: send reset code
  async function onSubmit(formData) {
    // Always fire the request but never reveal whether the email is registered.
    // Prevent email enumeration by showing the same vague message and always redirecting.
    await authClient.emailOtp.requestPasswordReset({
      email: formData.email,
    });
    toast.success("If your email is registered, you'll receive a reset code shortly.");
    router.push(`/reset-password?email=${encodeURIComponent(formData.email || "")}`);
  }

  const loading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    className="h-12 pl-12 pr-4 rounded-sm"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton type="submit" className="w-full h-10 md:h-12 rounded-sm" loading={loading}>
          Send Reset Code
        </LoadingButton>
      </form>
    </Form>
  );
}