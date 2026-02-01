import { StudentsForm } from "./students-form";
import VerifyEmailButton from "../shared/verify-email-button";

export const metadata = {
  title: "Settings - Students",
  description: "Manage your students and their information",
};

export default async function StudentsSettingsPage() {

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Verify Email Button */}
        <VerifyEmailButton />

        {/* Header Section - Students Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">

          {/* Students Settings header */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Students Settings
          </h1>

          {/* Students Settings description */}
          <p className="text-xl sm:text-2xl text-gray-600 font-medium mx-auto">
            Manage your students and their information including personal details, attendance, and subjects.
          </p>
        </div>

        {/* Students Form */}
        <div className="w-full mx-auto">
          <StudentsForm />
        </div>
      </div>
    </main>
  );
}