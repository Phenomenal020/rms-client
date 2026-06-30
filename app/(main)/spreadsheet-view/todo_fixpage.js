// import SpreadsheetComponent from "./SpreadsheetComponent";
// import { getServerSession } from "@/src/lib/get-session";
// import { redirect } from "next/navigation";
// import prisma from "@/src/lib/prisma";

// const SpreadsheetPage = async () => {
//   const session = await getServerSession();
//   if (!session) {
//     redirect("/sign-in");
//   }

//   const user = await prisma.user.findUnique({
//     where: {
//       id: session.user.id,
//     },
//     include: {
//       school: true,
//       academicTerms: {
//         include: {
//           subjects: {
//             orderBy: {
//               createdAt: 'asc',
//             },
//           },
//           assessmentStructure: {
//             orderBy: {
//               order: 'asc', // Order by the order field
//             },
//           },
//           gradingSystem: {
//             orderBy: {
//               minScore: 'desc',
//             },
//           },
//           students: {
//             include: {
//               subjects: {
//                 include: {
//                   subject: true,
//                 },
//               },
//               assessments: {
//                 include: {
//                   subject: true,
//                   scores: {
//                     include: {
//                       assessmentStructure: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//           school: true,
//         },
//         orderBy: {
//           createdAt: 'desc', // Get most recent term first
//         },
//         take: 1, // Get only the most recent term
//       },
//     },
//   });

//   if (!user) {
//     redirect("/sign-in");
//   }

//   // Get the most recent academic term (or first one if available)
//   const academicTerm = user.academicTerms?.[0] || null;

//   if (!academicTerm) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
//         <p className="text-gray-500">No academic term found. Please create an academic term first.</p>
//       </div>
//     );
//   }

//   return (
//     // <SpreadsheetComponent user={user} academicTerm={academicTerm} />
//   );
// };

// export default SpreadsheetPage;
