"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/auth-client";
import { toast } from "sonner";
import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shadcn/ui/input-otp";
import { Button } from "@/shadcn/ui/button";
import { ChevronLeft, ShieldCheck } from "lucide-react";

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
        <Card className="w-full max-w-md relative">

            {/* Back to previous page */}
            <div className="absolute top-0 left-0 flex justify-center mt-2">
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

            {/* Header */}
            <CardHeader className="text-center pt-12">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg md:text-xl">Two-factor verification</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                    A 6-digit verification code was sent to{" "}
                    <span className="font-medium">{email || "your email"}</span>. Enter it below to complete sign-in.
                </CardDescription>
            </CardHeader>

            {/* Content */}
            <CardContent className="space-y-6 w-full">
                {/* OTP Input */}
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
                    Verify
                </LoadingButton>

                <p className="text-center text-xs text-muted-foreground">
                    Didn&apos;t receive a code?{" "}
                    <LoadingButton
                        variant="link"
                        className="p-0 h-auto text-xs font-semibold text-primary disabled:opacity-50"
                        loading={isResending}
                        disabled={resendCooldown > 0}
                        onClick={handleResend}
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                    </LoadingButton>
                    {" "}or check your spam folder.
                </p>
            </CardContent>
        </Card>
    );
}