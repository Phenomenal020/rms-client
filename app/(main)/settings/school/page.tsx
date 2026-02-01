import { unauthorized } from "next/navigation";
import VerifyEmailButton from "../shared/verify-email-button";
import SchoolTabs from "./school-tabs";
import type { Metadata } from "next";
import { getUserWithRelations } from "@/fetcher/queries";

// metadata for the school settings page
export const metadata: Metadata = {
  title: "Settings - School",
  description: "Manage school information",
};

export default async function SchoolSettingsPage(): Promise<React.ReactElement> {

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">
      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Verify Email Button */}
        <VerifyEmailButton />

        {/* Header Section - School Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">
          {/* School Settings > header */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            School Settings
          </h1>

          {/* School Settings > description */}
          <p className="text-lg sm:text-2xl text-gray-600 font-medium mx-auto">
            Manage your school and term information.
          </p>
        </div>

        {/* School and Term Forms in Tabs */}
        <div className="w-full mx-auto">
          <SchoolTabs
          />
        </div>
      </div>
    </main>
  )
}
