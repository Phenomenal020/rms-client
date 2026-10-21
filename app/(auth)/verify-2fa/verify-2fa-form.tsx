"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/auth-client";
import { USER_WITH_RELATIONS_KEY } from "@/fetcher/keys";
import { toast } from "sonner";
import { mutate } from "swr";
import { LoadingButton } from "@/shared-components/loading-button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shadcn/ui/input-otp";
import { Button } from "@/shadcn/ui/button";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { EDUCATION_SPEECHES } from "@/shared-components/quotes";

// Helper function to check if the sign-in expired
function isSignInExpired(error: { code?: string; message?: string }) {
    return (
        error.code === "INVALID_TWO_FACTOR_COOKIE" ||
        error.message?.toLowerCase().includes("two factor cookie") === true
    );
}

export function Verify2FAForm({ email }: { email: string }) {
    // router for redirects
    const router = useRouter();

    // otp state
    const [otp, setOtp] = useState("");

    // is verifying state
    const [isVerifying, setIsVerifying] = useState(false);

    // Resend cooldown: tracks remaining seconds; 0 means the button is available
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Randomise speech index (after mount to avoid hydration mismatch)
    const [speechIndex, setSpeechIndex] = useState(0);
    useEffect(() => {
        setSpeechIndex(Math.floor(Math.random() * EDUCATION_SPEECHES.length));
    }, []);
    const speech = EDUCATION_SPEECHES[speechIndex];

    // Start the resend cooldown timer (60s)
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

    // Redirect users to the sign-in page if the otp expired
    function redirectToSignIn() {
        toast.error("Your sign-in expired. Please sign in again.");
        router.replace("/sign-in");
    }

    // Handle resend. sendOtp only works while the sign-in cookie from the password step is still valid.
    async function handleResend() {
        // Set the is resending state to true (loading indicator on Resend button)
        setIsResending(true);
        // Send the otp
        const { error } = await authClient.twoFactor.sendOtp();
        // Set the is resending state to false
        setIsResending(false);
        // If there is an error, check if the sign-in expired
        if (error) {
            // If the sign-in expired, redirect to the sign-in page
            if (isSignInExpired(error)) {
                redirectToSignIn();
                return;
            }
            // Else, this show an error
            toast.error("Something went wrong. Please try again later.");
            return;
        }
        // Start the resend cooldown timer
        startCooldown();
        // Show a success toast
        toast.success("A new verification code has been sent.");
        // Clear the otp input so the user can check their email andenter the new code
        setOtp("");
    }
// 
    // Handle verify: Verifies the otp, clears session cookie and client cache, and redirects to the dashboard or onboarding page
    async function handleVerify() {
        if (isVerifying) {
            return;
        }
        
        // If the otp is not 6 digits, show an error
        if (otp.length !== 6) {
            toast.error("Please enter the full 6-digit code.");
            return;
        }

        // Set the is verifying state to true (loading indicator on Verify button)
        setIsVerifying(true);

        // Actually verify the otp
        const { error } = await authClient.twoFactor.verifyOtp({
            code: otp,
            trustDevice: true,   // remembers this device so 2FA is not asked again for 30 days
        });

        // update otp verification state
        setIsVerifying(false);

        // If there is an error, check if the sign-in expired
        if (error) {
            if (isSignInExpired(error)) {
                // If the sign-in expired, redirect to the sign-in page
                redirectToSignIn();
                return;
            }
            // Else, this show an invalid/expired otp code error
            toast.error("Invalid or expired code. Please try again.");
            setOtp("");
            return;
        }

        // Ensure session cookie + client cache are ready before SessionGate runs on /dashboard
        const session = await authClient.getSession();
        await mutate(USER_WITH_RELATIONS_KEY);

        // If the user is not onboarded, redirect to the onboarding page
        const onboardingStatus = session.data?.user?.onboardingStatus;
        if (onboardingStatus !== "APPROVED") {
            toast.success("Verified! Complete onboarding to continue.");
            router.replace("/onboarding");
            return;
        }

        // If the user is onboarded, redirect to the dashboard
        toast.success("Verified! Redirecting…");
        router.replace("/dashboard");
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

            {/* Right Side - Two-Factor Verification Form */}
            <section className="flex flex-col justify-center px-8 py-10 md:w-1/2">
                <div className="mx-auto w-full max-w-sm space-y-8">
                    {/* Back to previous page */}
                    <Button
                        variant="link"
                        size="sm"
                        className="inline-flex h-auto items-center gap-1 p-0 text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="size-4" aria-hidden="true" />
                        Back
                    </Button>

                    {/* Title and Description */}
                    <div className="space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl font-semibold tracking-tight">Two-factor verification</h1>
                            <p className="text-sm text-muted-foreground">
                                A 6-digit verification code was sent to{" "}
                                <span className="font-medium text-foreground">{email || "your email"}</span>.
                                {" "}Enter it below to complete sign-in.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* OTP Input */}
                        <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={setOtp}
                            onComplete={handleVerify}
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
                            onClick={handleVerify}
                        >
                            Verify
                        </LoadingButton>

                        {/* Didnt receive a code? Resend or Resend in <cooldown> seconds  */}
                        <p className="text-center text-sm text-muted-foreground">
                            Didn&apos;t receive a code?{" "}
                            <LoadingButton
                                variant="link"
                                className="h-auto p-0 font-medium text-foreground hover:underline disabled:opacity-50"
                                loading={isResending}
                                disabled={resendCooldown > 0}
                                onClick={handleResend}
                            >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                            </LoadingButton>
                            {" "}or check your spam folder.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}