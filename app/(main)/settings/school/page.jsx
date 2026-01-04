import { getServerSession } from "@/src/lib/get-session";
import { unauthorized } from "next/navigation";
import prisma from "@/src/lib/prisma";
import VerifyEmailButton from "../shared/verify-email-button";
import SchoolTabs from "./school-tabs";

// metadata for the school settings page
export const metadata = {
  title: "Settings - School",
  description: "Manage school information",
};

export default async function SchoolSettingsPage() {
  
  // get the server session
  const session = await getServerSession();

  // get the session user
  const sessionUser = session?.user;

  // if there is no session user, then return the unauthorised page
  if (!sessionUser) unauthorized();

  // get the user from the database with school and academic term information
  const user = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },
    include: {
      school: true,
      academicTerms: {
        include: {
          gradingSystem: true,
          class: true,
        },
        take: 1, // Get the first term for now
      },
    },
  });

  // if there is no user, then return the unauthorised page
  if (!user) unauthorized();

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">
      <div className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        
        {/* Verify Email Button */}
        <VerifyEmailButton />

        {/* Header Section - School Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">
          {/* School Settings > header */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            School Settings
          </h1>

          {/* School Settings > description */}
          <p className="text-base sm:text-lg text-gray-600 font-medium mx-auto">
            Manage your school and term information.
          </p>
        </div>

        {/* School and Term Forms in Tabs */}
        <div className="w-full mx-auto">
          <SchoolTabs 
            school={user.school} 
            academicTerm={user.academicTerms?.[0]}
            schoolId={user.schoolId}
          />
        </div>
      </div>
    </main>
  );
}

