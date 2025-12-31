"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { authClient } from "@/src/lib/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ResendVerificationButton({ email }) {

  // State for loading indicator and cooldown (to prevent email spamming)
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  // Timer for cooldown
  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function resendVerificationEmail() {
    if (cooldown > 0) return;

    setIsLoading(true);  // loading indicator
 
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/sign-in",
      });

      if (error) {
        toast.error("Something went wrong. Please try again.");
      } else {
        toast.success("Verification email sent. Please check your inbox.");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // hide the loading indicator
      setCooldown(60); // start 60s cooldown no matter what to prevent spamming
    }
  }

  return (
    <div className="space-y-4">
      <LoadingButton
        onClick={resendVerificationEmail} 
        className="w-full"
        loading={isLoading}
        disabled={isLoading || cooldown > 0}
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
      </LoadingButton>
    </div>
  );
}

