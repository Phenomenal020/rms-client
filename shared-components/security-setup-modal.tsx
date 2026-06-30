"use client";

import { useState } from "react";
import { authClient } from "@/src/auth-client";
import { toast } from "sonner";
import { Button } from "@/shadcn/ui/button";
import { LoadingButton } from "@/shared-components/loading-button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shadcn/ui/dialog";
import { PasswordInput } from "@/shared-components/password-input";
import { ShieldCheck, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Step =
    | "enable-2fa"      // enter password → enable 2FA
    | "2fa-success";    // 2FA enabled confirmation


export function SecuritySetupModal() {
    // Get the router
    const router = useRouter();

    // Get the session data
    const { data: session } = authClient.useSession();

    // State for toggling the dialog
    const [open, setOpen] = useState(false);
    // State for tracking dialog step (default is "enable-2fa")
    const [step, setStep] = useState<Step>("enable-2fa");

    // Password input state
    const [password, setPassword] = useState("");
    // State for tracking the enabling 2FA process
    const [enabling2FA, setEnabling2FA] = useState(false);

    // Reset inner state when the dialog is closed
    function handleClose() {
        setOpen(false);
        setStep("enable-2fa");
        setPassword("");
    }

    // Step: Enable 2FA 
    async function handleEnable2FA() {
        // Validate the password
        if (!password) {
            toast.error("Please enter your current password");
            return;
        }

        // Enable 2FA state
        setEnabling2FA(true);

        // enable 2FA
        const { error } = await authClient.twoFactor.enable({ password });
        
        // Disable loading state
        setEnabling2FA(false);

        // If there is an error, show the error message
        if (error) {
            toast.error(error.message ?? "Failed to enable 2FA. Check your password and try again.");
            return;
        }

        // Otherwise, clear the password and go to the next step
        setPassword("");
        setStep("2fa-success");

        // signout
        await authClient.signOut();
        // redirect to the login page
        router.push("/sign-in");
    }

    // Don't render if 2FA is already enabled
    if (!session?.user || session.user.twoFactorEnabled) return null;

    // ── Rendering ─────────────────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>

            {/* Badge trigger — shown on the web pages when 2FA is not yet enabled */}
            <DialogTrigger asChild>
                <Button className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300 cursor-pointer">
                    <ShieldCheck className="h-4 w-4" />
                    Enable 2FA Login
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">

                {/* Back button — visible on the "enable-2fa" step only */}
                {step === "enable-2fa" && (
                    <Button
                        onClick={() => setStep("enable-2fa")}
                        className="absolute top-4 left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Button>
                )}

                {/* Step: Enable 2FA with password confirmation */}
                {step === "enable-2fa" && (
                    <>
                        <DialogHeader className="pt-6">
                            <DialogTitle>Enable Two-factor Authentication</DialogTitle>
                            <DialogDescription>
                                Enter your current password to confirm. Once enabled, you will need to verify your identity with a code at each sign-in.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-4 mt-2">
                            {/* Password input */}
                            <PasswordInput
                                placeholder="Current password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleEnable2FA(); }}
                                className="h-12"
                            />
                            {/* Enable 2FA button */}
                            <LoadingButton
                                loading={enabling2FA}
                                onClick={handleEnable2FA}
                                className="w-full h-10 md:h-12"
                            >
                                Enable 2FA
                            </LoadingButton>
                        </div>
                    </>
                )}

                {/* Step: 2FA Success */}
                {step === "2fa-success" && (
                    <>
                        <DialogHeader className="pt-2">
                            {/* Success icon */}
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                            </div>
                            {/* Success title */}
                            <DialogTitle className="text-center">2FA enabled!</DialogTitle>
                            {/* Success description */}
                            <DialogDescription className="text-center">
                                Your account is now protected. You will be asked for a verification code the next time you sign in.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-2">
                            <Button className="w-full h-12" onClick={handleClose}>
                                Done
                            </Button>
                        </div>
                    </>
                )}

            </DialogContent>
        </Dialog>
    );
}