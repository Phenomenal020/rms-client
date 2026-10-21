"use client";

import VerifyEmailButton from "@/app/(main)/shared/verify-email-button";
import { AccountForm } from "@/app/(main)/dashboard/(profile)/account-form";
import { PasswordForm } from "./password-form";
import { Preferences } from "./preferences";
import { useUser } from "@/contexts/user-context";
import Loading from "./loading";
import { ErrorBanner } from "@/shared-components/error-banner";

// Profile page component
export default function Profile() {
  // get the user from the database (deduplication allows me to do this without any issues)
  const { user, isLoading: isUserLoading, error: userError } = useUser();

  if (isUserLoading) {
    return <Loading />;
  }
  if (userError) {
    return <ErrorBanner message={userError.message} />;
  }

  // return the main layout
  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-5xl">

        {/* Verify Email Button - if user email is not verified */}
        {/* <VerifyEmailButton /> */}

        {/* Profile sections — tabbed layout */}
        <div className="w-full mx-auto space-y-6">
          <AccountForm user={user}/>
          <PasswordForm />
          <Preferences />
        </div>
      </div>
    </main>
  );
}