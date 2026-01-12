// imports: current session, unauthorised page, teacher profile form, prisma
import { auth } from "@/src/lib/auth";
import { unauthorized } from "next/navigation";
import prisma from "@/src/lib/prisma";
import VerifyEmailButton from "../shared/verify-email-button";
import TeacherProfileTabs from "./teacher-profile-tabs";
import { headers } from "next/headers";


// page metadata: title and description
export const metadata = {
  title: "Settings - Teacher Profile",
  description: "Manage your profile information",
};

// page component
export default async function SettingsPage() {

  // get the headers
  const headerList = await headers()

  // get the user from the session
  const session = await auth.api.getSession({ headers: headerList })
  const sessionUser = session?.user;

  // if there is no session user, then return the unauthorised page
  if (!sessionUser) unauthorized();

  // check if the user has signed up via a password or used oauth (This is for the password reset/change tab)
  const accounts = await auth.api.listUserAccounts({ headers: headerList })
  const hasPasswordAccount = accounts.some(account => account.providerId === "credential") // true if the user has a password associated with this account.

  // get all the user's sessions (This is for the sessions tab) 
  const sessions = await auth.api.listSessions({ headers: headerList })
  // as well as the current session token
  const currentSessionToken = session?.session?.token ?? ""

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

        {/* Verify Email Button - if user email is not verified */}
        <VerifyEmailButton />

        {/* Header Section - Profile Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">

          {/* Profile Settings > header */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Profile Settings
          </h1>

          {/* Profile Settings > description */}
          <p className="text-base sm:text-lg text-gray-600 font-medium mx-auto mb-6">
            Manage your account information, update email, and password.
          </p>

        </div>

        {/* Profile Sections - Organised in tabs layout */}
        <div className="w-full mx-auto">
          <TeacherProfileTabs user={user} hasPasswordAccount={hasPasswordAccount} sessions={sessions} currentSessionToken={currentSessionToken} />
        </div>

      </div>
    </main>
  );
}