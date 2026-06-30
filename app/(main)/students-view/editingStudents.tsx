// "use client";

// import type { Student, AcademicTerm } from "@/types/drizzle";

// interface StudentInfoProps {
//     selectedStudent: Student;
//     academicTerm: AcademicTerm;
// }

// export function StudentInfo({
//     selectedStudent,
//     academicTerm,
// }: StudentInfoProps) {
//     // Build full name: firstName + middleName (if exists) + lastName
//     const fullName = [
//         selectedStudent.firstName,
//         selectedStudent.middleName,
//         selectedStudent.lastName,
//     ]
//         .filter(Boolean)
//         .join(" ");

//     return (
//         <div className="mb-6 space-y-1">
//             {/* Student Name */}
//             <p className="text-sm sm:text-base w-full mb-3">
//                 <span className="font-semibold text-muted-foreground">Student Name: </span>
//                 <span className="text-foreground">{fullName}</span>
//             </p>

//             <div className="mb-6 grid grid-cols-1 grid-cols-2 md:grid-cols-4 gap-2">
//                 <p className="text-sm sm:text-base w-full">
//                     <span className="font-semibold text-muted-foreground">Class: </span>
//                     <span className="text-foreground">{academicTerm?.class?.name}</span>
//                 </p>
//                 <p className="text-sm sm:text-base w-full">
//                     <span className="font-semibold text-muted-foreground"> Position: </span>
//                     <span className="text-foreground">N/A</span>
//                 </p>
//             </div>


//         </div>
//     );
// }
