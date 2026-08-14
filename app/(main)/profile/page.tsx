// imports: teacher profile form
import VerifyEmailButton from "../shared/verify-email-button";
import TeacherProfileTabs from "./teacher-profile-tabs";
import type { Metadata } from "next";

// page metadata: title and description
export const metadata: Metadata = {
  title: "Settings - Teacher Profile",
  description: "Manage your profile information",
};

// page component (Server Component - no data fetching here)
export default function SettingsPage() {

  // return the main layout
  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Verify Email Button - if user email is not verified */}
        <VerifyEmailButton />

        {/* Header Section - Profile Settings + paragraph */}
        <div className="mb-6">

          {/* Profile Settings > header */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Profile Settings
          </h1>

          {/* Profile Settings > description */}
          <p className="text-base text-muted-foreground font-medium mx-auto mb-4">
            Manage your account information, update email, and password.
          </p>

        </div>

        {/* Profile sections — continuous scroll */}
        <div className="w-full mx-auto">
          <TeacherProfileTabs /> {/* Used to be tabs, now continuous scroll */}
        </div>

      </div>
    </main>
  );
}