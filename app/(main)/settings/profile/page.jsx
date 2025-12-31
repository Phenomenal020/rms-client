// imports: current session, unauthorised page, teacher profile form, prisma
import { getServerSession } from "@/src/lib/get-session";
import { unauthorized } from "next/navigation";
import prisma from "@/src/lib/prisma";
import VerifyEmailButton from "../shared/verify-email-button";
import TeacherProfileTabs from "./teacher-profile-tabs";


// page metadata: title and description
export const metadata = {
  title: "Settings - Teacher Profile",
  description: "Manage your profile information",
};

// page component
export default async function SettingsPage() {
  // get the server session
  const session = await getServerSession();
  const sessionUser = session?.user;

  // if there is no session user, then return the unauthorised page
  if (!sessionUser) unauthorized();

  // Fetch fresh user data from database to ensure we have the latest fields
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      subscription: true,
    },
  });

  // if there is no user, then return the unauthorised page
  if (!user) unauthorized();

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Verify Email Button */}
        <VerifyEmailButton />

        {/* Header Section - Profile Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">

          {/* Profile Settings header */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Profile Settings
          </h1>

          {/* Profile Settings description */}
          <p className="text-base sm:text-lg text-gray-600 font-medium mx-auto mb-6">
            Manage your account information, update email, and password.
          </p>
        </div>

        {/* Profile Sections - Organised in tabs layout */}
        <div className="w-full mx-auto">
          <TeacherProfileTabs user={user} />
        </div>
      </div>
    </main>
  );
}