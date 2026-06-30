"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/auth-client";
import { toast } from "sonner";
import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shadcn/ui/input-otp";
import { ChevronLeft, MailIcon } from "lucide-react";
import { Button } from "@/shadcn/ui/button";

// Verify email component
export function VerifyEmailForm({ email }: { email: string }) {
    // Router for navigation
    const router = useRouter();

    // State for OTP input
    const [otp, setOtp] = useState("");

    // States for loading indicators
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Resend cooldown: tracks remaining seconds; 0 means the button is available
    const [resendCooldown, setResendCooldown] = useState(0);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    function startCooldown() {
        setResendCooldown(60);
        cooldownRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    // On click verify email button
    async function handleVerify() {
        // Reject OTP not 6 digits
        if (otp.length !== 6) {
            toast.error("Please enter the full 6-digit code.");
            return;
        }

        // For loading indicator
        setIsVerifying(true);

        // Verify email (validates and consumes the OTP in one step)
        const { error: verifyEmailError } = await authClient.emailOtp.verifyEmail({
            email,
            otp,
        });

        // Update loading indicator
        setIsVerifying(false);

        // If invalid, expired, or any other error
        if (verifyEmailError) {
            toast.error("Invalid or expired code. Please try again.");
            setOtp("");
            return;
        }

        // Redirect to dashboard
        toast.success("Email verified! Redirecting to dashboard...");
        router.push("/dashboard");
    }

    // On click resend verification code button
    async function handleResend() {
        // For loading indicator
        setIsResending(true);

        // Resend otp for email verification
        const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "email-verification",
        });

        // Update loading indicator
        setIsResending(false);

        // If error, show error toast
        if (resendError) {
            toast.error("Something went wrong. Please try again later.");
            return;
        }

        // Start cooldown, show success toast, and reset OTP
        startCooldown();
        toast.success("A new verification code has been sent.");
        setOtp("");
    }

    return (
        <Card className="w-full max-w-md relative">

            <div className="flex justify-center mt-2 absolute top-0 left-0">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-8 w-8" />
                    Back
                </Button>
            </div>

            {/* Card Header */}
            <CardHeader className="text-center">
                {/* Email icon */}
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                    <MailIcon className="h-6 w-6 text-primary" />
                </div>
                {/* Title: Verify your email */}
                <CardTitle className="text-lg md:text-xl">Verify your email</CardTitle>
                {/* Description: A 6-digit verification code was sent to your email. Please enter it below. */}
                <CardDescription className="text-xs md:text-sm">
                    A 6-digit verification code was sent to{" "}
                    <span className="font-medium">{email || "your email"}</span>. Please enter it below.
                </CardDescription>


            </CardHeader>

            {/* Content */}
            <CardContent className="space-y-6">
                {/* OTP Input Field */}
                <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleVerify}
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

                {/* Verify Button */}
                <LoadingButton
                    className="w-full h-10 md:h-12 rounded-sm"
                    loading={isVerifying}
                    onClick={handleVerify}
                >
                    Verify Email
                </LoadingButton>

                {/* Resend Verification Code Button */}
                <div className="text-center text-sm text-muted-foreground">
                    Didn't receive a code?{" "}
                    <LoadingButton
                        variant="link"
                        className="p-0 h-auto font-semibold text-primary disabled:opacity-50"
                        loading={isResending}
                        disabled={resendCooldown > 0}
                        onClick={handleResend}
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                    </LoadingButton>
                </div>
            </CardContent>
        </Card>
    );
}