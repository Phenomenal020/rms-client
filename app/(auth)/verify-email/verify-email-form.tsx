"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/auth-client";
import { toast } from "sonner";
import { LoadingButton } from "@/shared-components/loading-button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shadcn/ui/input-otp";
import { ChevronLeft, MailIcon } from "lucide-react";
import { EDUCATION_SPEECHES } from "@/shared-components/quotes";

// Keep in sync with the backend configuration
const MAX_OTP_ATTEMPTS = 2;

// Verify email component
export function VerifyEmailForm({ email }: { email: string }) {
    // Router for navigation
    const router = useRouter();

    // State for OTP input
    const [otp, setOtp] = useState("");

    // States for loading indicators
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Failed verify attempts for the current code (server allows 2)
    const [failedAttempts, setFailedAttempts] = useState(0);
    const attemptsExhausted = failedAttempts >= MAX_OTP_ATTEMPTS;

    // Resend cooldown: tracks remaining seconds; 0 means the button is available
    const [resendCooldown, setResendCooldown] = useState(0);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Randomise speech index (after mount to avoid hydration mismatch)
    const [speechIndex, setSpeechIndex] = useState(0);
    useEffect(() => {
        setSpeechIndex(Math.floor(Math.random() * EDUCATION_SPEECHES.length));
    }, []);
    const speech = EDUCATION_SPEECHES[speechIndex];

    // Clear cooldown timer on unmount
    useEffect(() => {
        return () => {
            // clear the cooldown timer if it exists
            if (cooldownRef.current) {
                clearInterval(cooldownRef.current);
            }
        };
    }, []);

    // Start the cooldown timer
    function startCooldown() {
        setResendCooldown(60);
        // clear the cooldown timer if it exists
        if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
        }
        // start the cooldown timer
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
        }, 1000); // 1 second interval
    }

    // On click verify email button
    async function handleVerify() {
        // do not fire if verifying
        if (isVerifying) {
            return;
        }

        // do not fire if attempts are exhausted
        if (attemptsExhausted) {
            toast.error("Too many attempts for this code. Request a new one.");
            return;
        }

        // Reject OTP not 6 digits
        if (otp.length !== 6) {
            toast.error("Please enter the full 6-digit code.");
            return;
        }

        // For loading indicator
        setIsVerifying(true);

        // Verify email (validates and consumes the OTP in one step)
        const { error: verifyEmailError, data: verifyEmailData } = await authClient.emailOtp.verifyEmail({
            email,
            otp,
        });

        // Update loading indicator
        setIsVerifying(false);

        // If invalid, expired, or any other error
        if (verifyEmailError || !verifyEmailData) {
            // increment the failed attempts
            const nextFailed = failedAttempts + 1;
            // update the failed attempts
            setFailedAttempts(nextFailed);
            // reset the OTP
            setOtp("");

            // if the failed attempts are greater than or equal to the maximum allowed attempts, show the error toast
            if (nextFailed >= MAX_OTP_ATTEMPTS) {
                toast.error("Too many attempts. Request a new verification code.");
            } else {
                const remaining = MAX_OTP_ATTEMPTS - nextFailed;
                toast.error(
                    `Invalid or expired code. ${remaining} attempt${remaining === 1 ? "" : "s"} left`,
                );
            }
            return;
        }

        // Conditionally redirect to dashboard
        if (verifyEmailData.user.onboardingStatus !== "APPROVED") {
            toast.success("Email verified! Complete the onboarding to access your account.");
            router.push("/onboarding");
        } else {
            toast.success("Email verified! Redirecting to dashboard...");
            router.push("/dashboard");
        }
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

        // New code → reset attempts, start cooldown, show success toast, and reset OTP
        setFailedAttempts(0);
        startCooldown();
        toast.success("A new verification code has been sent.");
        setOtp("");
    }

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

            {/* Right Side - Verify Email Form */}
            <section className="flex flex-col justify-center px-8 py-10 md:w-1/2">
                <div className="mx-auto w-full max-w-sm space-y-8">
                    {/* Back button */}
                    <Link
                        href="/sign-up"
                        replace
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="size-4" aria-hidden="true" />
                        Back
                    </Link>

                    {/* Title and Description */}
                    <div className="space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                            <MailIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl font-semibold tracking-tight">Verify your email</h1>
                            <p className="text-sm text-muted-foreground">
                                A 6-digit verification code was sent to{" "}
                                <span className="font-medium text-foreground">{email || "your email"}</span>.
                                {" "}Please enter it below.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* OTP Input Field */}
                        <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={setOtp}
                            onComplete={handleVerify}
                            disabled={isVerifying || attemptsExhausted}
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

                        {/* Verify Button */}
                        <LoadingButton
                            className="w-full"
                            loading={isVerifying}
                            disabled={attemptsExhausted}
                            onClick={handleVerify}
                        >
                            Verify Email
                        </LoadingButton>

                        {/* Resend Verification Code Button */}
                        <div className="text-center text-sm text-muted-foreground">
                            {attemptsExhausted
                                ? "This code can no longer be used. "
                                : "Didn't receive a code or code expired? "}
                            <LoadingButton
                                variant="link"
                                className="h-auto p-0 font-medium text-foreground hover:underline disabled:opacity-50"
                                loading={isResending}
                                disabled={resendCooldown > 0}
                                onClick={handleResend}
                            >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                            </LoadingButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
