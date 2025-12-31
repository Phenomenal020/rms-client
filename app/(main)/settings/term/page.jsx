import { getServerSession } from "@/src/lib/get-session";
import { unauthorized } from "next/navigation";
import { TermForm } from "./term-form";
import prisma from "@/src/lib/prisma";
import VerifyEmailButton from "../shared/verify-email-button";

export const metadata = {
  title: "Settings - Term",
  description: "Manage term information and grading system",
};

export default async function TermSettingsPage() {
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

  // User must have a school before managing terms
  if (!user.schoolId) {
    return (
      <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">
        <div className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2">
              Term Settings
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-medium mx-auto">
              Please set up your school information first before managing terms.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const academicTerm = user.academicTerms?.[0];

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">
      <div className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        
        {/* Verify Email Button */}
        <VerifyEmailButton />

        {/* Header Section - Term Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">
          {/* Term Settings header */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Term Settings
          </h1>

          {/* Term Settings description */}
          <p className="text-base sm:text-lg text-gray-600 font-medium mx-auto">
            Manage your term information, dates, and grading system.
          </p>
        </div>

        {/* Term Form */}
        <div className="w-full mx-auto">
          <TermForm academicTerm={academicTerm} schoolId={user.schoolId} />
        </div>
      </div>
    </main>
  );
}

