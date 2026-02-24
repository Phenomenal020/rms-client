// imports: students form
import { StudentsForm } from "./students-form";
import VerifyEmailButton from "../shared/verify-email-button";
import type { Metadata } from "next";

// page metadata: title and description
export const metadata: Metadata = {
  title: "Settings - Students",
  description: "Manage your students and their information",
};

// page component (Server Component - no data fetching here)
export default function StudentsSettingsPage() {

  // return the main layout
  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Verify Email Button - if user email is not verified */}
        <VerifyEmailButton />

        {/* Header Section - Students Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">

          {/* Students Settings > header */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-1">
            Students Settings
          </h1>

          {/* Students Settings > description */}
          <h3 className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-medium mx-auto mb-4">
            Manage your students and their information including personal details, attendance, and subjects.
          </h3>

        </div>

        {/* Students Form */}
        <div className="w-full mx-auto">
          <StudentsForm />
        </div>

      </div>
    </main>
  );
}