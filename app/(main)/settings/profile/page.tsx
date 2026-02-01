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
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Verify Email Button - if user email is not verified */}
        <VerifyEmailButton />

        {/* Header Section - Profile Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">

          {/* Profile Settings > header */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Profile Settings
          </h1>

          {/* Profile Settings > description */}
          <p className="text-lg sm:text-2xl text-gray-600 font-medium mx-auto mb-6">
            Manage your account information, update email, and password.
          </p>

        </div>

        {/* Profile Sections - Organised in tabs layout */}
        <div className="w-full mx-auto">
          <TeacherProfileTabs />
        </div>

      </div>
    </main>
  );
}