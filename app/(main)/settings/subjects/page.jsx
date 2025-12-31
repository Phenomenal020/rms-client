import { getServerSession } from "@/src/lib/get-session";
import { unauthorized } from "next/navigation";
import { SubjectsForm } from "./subjects-form2";
import prisma from "@/src/lib/prisma";
import VerifyEmailButton from "../shared/verify-email-button";

// Metadata
export const metadata = {
  title: "Settings - Subjects",
  description: "Manage your subjects and assessment structures",
};

// Subjects Settings Page
export default async function SubjectsSettingsPage() {
  // get the server session
  const session = await getServerSession();
  // get the session user
  const sessionUser = session?.user;

  // if there is no session user, then return the unauthorised page
  if (!sessionUser) unauthorized();

  // get the user from the database using the id from the session user
  const user = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },
    include: {
      school: {
        include: {
          academicTerms: {
            orderBy: {
              createdAt: 'desc', // Get most recent term first
            },
            take: 1, // Get only the most recent academic term
            include: {
              subjects: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
              assessmentStructure: {
                orderBy: {
                  order: 'asc', // Order by the order field
                },
              },
            },
          },
        },
      },
    },
  });

  // Attach subjects and assessmentStructure from the most recent academic term to the school object
  // This makes it compatible with the form which expects user.school.subjects and user.school.assessmentStructure
  if (user?.school) {
    const mostRecentTerm = user.school.academicTerms?.[0];
    if (mostRecentTerm) {
      user.school.subjects = mostRecentTerm.subjects || [];
      user.school.assessmentStructure = mostRecentTerm.assessmentStructure || [];
    } else {
      // If no academic term exists, initialize with empty arrays
      user.school.subjects = [];
      user.school.assessmentStructure = [];
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Verify Email Button */}
        <VerifyEmailButton />

        {/* Header Section - Subjects Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">

          {/* Subjects Settings header */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Subjects Settings
          </h1>

          {/* Subjects Settings description */}
          <p className="text-base sm:text-lg text-gray-600 font-medium mx-auto">
            Manage your subjects and their assessment structures.
          </p>
        </div>

        {/* Subjects Form */}
        <div className="w-full mx-auto">
          <SubjectsForm user={user} />
        </div>
      </div>
    </main>
  );
}