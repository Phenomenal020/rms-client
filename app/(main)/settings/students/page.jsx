import { getServerSession } from "@/src/lib/get-session";
import { unauthorized } from "next/navigation";
import { StudentsForm } from "./students-form";
import prisma from "@/src/lib/prisma";
import VerifyEmailButton from "../shared/verify-email-button";

export const metadata = {
  title: "Settings - Students",
  description: "Manage your students and their information",
};

export default async function StudentsSettingsPage() {
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
      school: true,
      academicTerms: {
        orderBy: {
          createdAt: 'desc', // Get the most recent academic term
        },
        take: 1,
        include: {
          subjects: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          students: {
            include: {
              subjects: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Verify Email Button */}
        <VerifyEmailButton />

        {/* Header Section - Students Settings + paragraph */}
        <div className="text-center mb-10 sm:mb-12">

          {/* Students Settings header */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Students Settings
          </h1>

          {/* Students Settings description */}
          <p className="text-base sm:text-lg text-gray-600 font-medium mx-auto">
            Manage your students and their information including personal details, attendance, and subjects.
          </p>
        </div>

        {/* Students Form */}
        <div className="w-full mx-auto">
          <StudentsForm user={user} />
        </div>
      </div>
    </main>
  );
}

