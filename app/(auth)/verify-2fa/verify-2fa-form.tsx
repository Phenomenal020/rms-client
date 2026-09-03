"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/auth-client";
import { toast } from "sonner";
import { LoadingButton } from "@/shared-components/loading-button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shadcn/ui/input-otp";
import { Button } from "@/shadcn/ui/button";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { EDUCATION_SPEECHES } from "@/shared-components/quotes";

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

    async function handleResend() {
        setIsResending(true);

        const { error } = await authClient.twoFactor.sendOtp();

        setIsResending(false);

        if (error) {
            toast.error("Something went wrong. Please try again later.");
            return;
        }

        startCooldown();
        toast.success("A new verification code has been sent.");
        setOtp("");
    }

    async function handleVerify() {
        // if the otp is not 6 digits, show an error
        if (otp.length !== 6) {
            toast.error("Please enter the full 6-digit code.");
            return;
        }

        // set the is verifying state to true
        setIsVerifying(true);

        // verify the otp
        const { error } = await authClient.twoFactor.verifyOtp({
            code: otp,
            trustDevice: true,   // remembers this device so 2FA is not asked again for 30 days
        });

        // update otp verification state
        setIsVerifying(false);

        if (error) {
            toast.error("Invalid or expired code. Please try again.");
            setOtp("");
            return;
        }

        toast.success("Verified! Redirecting…");
        router.push("/dashboard");
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
