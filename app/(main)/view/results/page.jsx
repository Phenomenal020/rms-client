import ResultsComponent from "./ResultsComponent";
import { getServerSession } from "@/src/lib/get-session";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";

const ResultsPage = async () => {
  // Get the current session to identify the user
  const session = await getServerSession();
  const sessionUser = session?.user;
  if (!sessionUser) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      school: true,
      academicTerms: {
        include: {
          class: true, // get class information for the term
          subjects: { orderBy: { createdAt: "asc" } }, // get subjects for the term
          assessmentStructure: { orderBy: { order: "asc" } }, // get assessment structures for the term
          gradingSystem: { orderBy: { minScore: "desc" } }, // get grading system for the term
          students: {
            include: {
              subjects: { include: { subject: true } }, // get subjects for the student
              assessments: {
                include: {
                  subject: true,
                  scores: { include: { assessmentStructure: true } }, // get scores for the assessment
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // Check if there are any academic terms
  if (user?.academicTerms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">
          No academic term found. Please create an academic term first.
        </p>
      </div>
    );
  }

  // Otherwise, pass the user data to the ResultsComponent
  return <ResultsComponent user={user} />;
};

export default ResultsPage;