import ResultsComponent from "./ResultsComponent";
import { getServerSession } from "@/src/lib/get-session";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";

const ResultsPage = async () => {

  // Get the current session to identify the user
  const session = await getServerSession();
  const sessionUser = session?.user;

  // if there is no session user, redirect to sign in
  if (!sessionUser) {
    redirect("/sign-in");
  }

  // Get the user and all related data to display in the ResultsComponent. Fetching this once because the result sheet component renders all at once.
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      school: true,  // used for school header
      academicTerms: {
        include: {
          class: true, // get class information for the term
          subjects: { orderBy: { createdAt: "asc" } }, // get subjects for the term
          assessmentStructure: { orderBy: { order: "asc" } }, // get assessment structures for the term. Order by order field to ensure the assessment structures are in the correct order (eg, ca-1 before exam-3)
          gradingSystem: { orderBy: { minScore: "desc" } }, // get grading system for the term. Order by minScore field to ensure the grading system is in the correct order (eg, A before B)
          students: {
            include: {
              subjects: {  // subjects offered by the student (junction table for many-many relationship between students and subjects)
                include: {
                  subject: true,
                  assessments: {  // Assessments live here.
                    include:
                    {
                      scores: true  // assessments have scores (an array of scores according to the assessment structure)
                    }
                  }
                }
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  //cif the session user is not found in the database, redirect to sign in
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