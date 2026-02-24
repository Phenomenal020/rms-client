// imports: subjects settings form
import VerifyEmailButton from "../shared/verify-email-button";
import SubjectsTabs from "./subjects-tabs";
import type { Metadata } from "next";

// page metadata: title and description
export const metadata: Metadata = {
  title: "Settings - Subjects",
  description: "Manage your subjects and assessment structures",
};

// page component (Server Component - no data fetching here)
export default function SubjectsSettingsPage() {

  // return the main layout
  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Verify Email Button - if user email is not verified */}
        <VerifyEmailButton />

        {/* Header Section - Subjects Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">

          {/* Subjects Settings > header */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-1">
            Subjects Settings
          </h1>

          {/* Subjects Settings > description */}
          <h3 className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-medium mx-auto mb-4">
            Manage your subjects and their assessment structures.
          </h3>

        </div>

        {/* Subjects and Assessment Structure Forms in Tabs */}
        <div className="w-full mx-auto">
          <SubjectsTabs />
        </div>

      </div>
    </main>
  );
}