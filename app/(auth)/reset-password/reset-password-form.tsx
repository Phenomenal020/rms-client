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

export function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(formData: z.infer<typeof resetPasswordSchema>) {
    // On submit, check otp is valid
    const { error: validateOtpError, data: validateOtpData } = await authClient.emailOtp.checkVerificationOtp({
      email: email, // required
      otp: formData.otp,
      type: "forget-password",
    });

    // if there is no otp error, then reset password with the new password
    if (validateOtpError) {
      toast.error("Invalid or expired code. Please try again.");
      form.setValue("otp", "");
      return;
    } else {
      const { data: resetPasswordData, error: resetPasswordError } = await authClient.emailOtp.resetPassword({
        email: email, // required
        otp: formData.otp, // required
        password: formData.newPassword, // required
      })

      if (resetPasswordError) {
        toast.error("Failed to reset password. Please try again.");
        return;
      } else {
        toast.success("Password reset successfully. Please sign in.");
        router.push("/sign-in");
      }
    }

    async function handleResend() {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });

      if (error) {
        toast.error("Failed to resend code. Please try again.");
        return;
      }

      toast.success("A new reset code has been sent.");
      form.setValue("otp", "");
    }

    const loading = form.formState.isSubmitting;

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
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
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

              <LoadingButton type="submit" className="w-full h-14 rounded-sm" loading={loading}>
                Reset Password
              </LoadingButton>

              {/* Resend */}
              <div className="text-center text-sm text-muted-foreground">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-primary hover:underline"
                >
                  Resend
                </button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
}