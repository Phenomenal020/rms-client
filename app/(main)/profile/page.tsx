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
        <div className="text-center mb-10 sm:mb-12">

          {/* Profile Settings > header */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-1">
            Profile Settings
          </h1>

          {/* Profile Settings > description */}
          <h3 className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-medium mx-auto mb-4">
            Manage your account information, update email, and password.
          </h3>

        </div>

        {/* Profile Sections - Organised in tabs layout */}
        <div className="w-full mx-auto">
          <TeacherProfileTabs />
        </div>

      </div>
    </main>
  );
}