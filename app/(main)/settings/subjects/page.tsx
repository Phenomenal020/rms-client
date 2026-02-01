import VerifyEmailButton from "../shared/verify-email-button";
import SubjectsTabs from "./subjects-tabs";
import {Metadata} from "next";

// Metadata for the subjects settings page
export const metadata: Metadata = {
  title: "Settings - Subjects",
  description: "Manage your subjects and assessment structures",
};

// Subjects Settings Page
export default function SubjectsSettingsPage() {

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Verify Email Button */}
        <VerifyEmailButton />

        {/* Header Section - Subjects Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">

          {/* Subjects Settings header */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Subjects Settings
          </h1>

          {/* Subjects Settings description */}
          <p className="text-xl sm:text-2xl text-gray-600 font-medium mx-auto">
            Manage your subjects and their assessment structures.
          </p>
        </div>

        {/* Subjects and Assessment Structure Forms in Tabs */}
        <div className="w-full mx-auto">
          <SubjectsTabs />
        </div>
      </div>
    </main>
  );
}