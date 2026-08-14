'use client';

import { Button } from "@/shadcn/ui/button";
import { getUser } from "@/fetcher/queries";
import { MailIcon } from "lucide-react";
import Link from "next/link";
import { unauthorized } from "next/navigation";
import { UserData } from "@/types/updateProfile";
import { useUser } from "@/contexts/user-context";

export default function VerifyEmailButton() {

  const { user, isLoading, error } = useUser();

  if (user) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 pb-6">
        <div className="space-y-6">
          {/* if the user is not verified, show the email verification alert component */}
          {!user.emailVerified && <EmailVerificationAlert />}
        </div>
      </main>
    );
  }

  // Please verify your email address to access all features + Verify Email Button
  function EmailVerificationAlert() {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800/50 dark:bg-yellow-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MailIcon className="size-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-yellow-800 dark:text-yellow-200">
              Please verify your email address to save changes.
            </span>
          </div>
          <Button size="sm" asChild>
            <Link href={`/verify-email?email=${encodeURIComponent(user.email)}`}>Verify Email</Link>
          </Button>
        </div>
      </div>
    )
  }
}
