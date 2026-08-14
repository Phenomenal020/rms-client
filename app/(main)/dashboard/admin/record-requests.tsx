// "use client";

// import Link from "next/link";
// import { Card, CardContent } from "@/shadcn/ui/card";
// import { StatusBadge } from "../helpers/dashboard-badge";
// import { DashboardRequestsTableRowsSkeleton } from "../helpers/dashboard-loading";
// import { getRecentRequests, getTerms } from "@/fetcher/queries";
// import { useUser } from "@/contexts/user-context";
// import type { singleTermPayload } from "@/types/term";

// function recordStatusForBadge(status: string) {
//     if (status === "ACCEPTED") return "Accepted";
//     if (status === "REJECTED") return "Declined";
//     if (status === "PENDING") return "Pending";
//     return status;
// }

// /**
//  * Pending class-record export requests for the active term.
//  * Org-scoped API — platform admins see an explanatory empty state instead of fetching.
//  */
// export function RecordRequests({ title = "Record Requests" }: { title?: string }) {
//     const { user } = useUser();
//     const isPlatformAdmin = user?.role === "admin";

//     const { data: termsData } = getTerms(!isPlatformAdmin);
//     const activeTermId =
//         (termsData as singleTermPayload[] | null)?.find((t) => t.status === "ACTIVE")?.id ?? null;

//     const { data: recentRequests, error, isLoading, isValidating } = getRecentRequests(
//         isPlatformAdmin ? null : activeTermId,
//     );

//     return (
//         <Card className="border shadow-md">
//             <CardContent>
//                 <section className="overflow-hidden rounded-sm bg-card space-y-3">
//                     <h4 className="text-base font-semibold text-foreground md:text-lg">
//                         {title}
//                     </h4>
//                     <hr />

//                     {isPlatformAdmin ? (
//                         <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
//                             <p className="text-base font-medium text-muted-foreground">
//                                 Class record requests are reviewed by school organisation admins.
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="min-w-[480px] w-full table-fixed border-collapse text-sm md:text-base">
//                                 <thead>
//                                     <tr className="border-b border-border bg-muted/50">
//                                         <th className="w-[35%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
//                                             Teacher
//                                         </th>
//                                         <th className="w-[17.5%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
//                                             Class
//                                         </th>
//                                         <th className="w-[17.5%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
//                                             Status
//                                         </th>
//                                         <th className="w-[22.5%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground">
//                                             Date &amp; Time
//                                         </th>
//                                         <th
//                                             className="w-[7.5%] p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground"
//                                             aria-hidden
//                                         />
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {!activeTermId ? (
//                                         <tr>
//                                             <td colSpan={5} className="p-4">
//                                                 <p className="text-center text-muted-foreground">
//                                                     Activate an academic term to see pending record requests.
//                                                 </p>
//                                             </td>
//                                         </tr>
//                                     ) : isLoading || isValidating ? (
//                                         <DashboardRequestsTableRowsSkeleton columns={5} rows={3} />
//                                     ) : error ? (
//                                         <tr>
//                                             <td colSpan={5} className="p-4">
//                                                 <p className="text-center text-destructive">
//                                                     Could not load requests.
//                                                 </p>
//                                             </td>
//                                         </tr>
//                                     ) : recentRequests && recentRequests.length > 0 ? (
//                                         recentRequests.map((row) => (
//                                             <tr
//                                                 key={row.id}
//                                                 className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/40"
//                                             >
//                                                 <td className="p-3">
//                                                     <span className="font-medium text-foreground">
//                                                         {row.formTeacherName.trim()}
//                                                     </span>
//                                                 </td>
//                                                 <td className="p-3 text-foreground">{row.className}</td>
//                                                 <td className="p-1">
//                                                     <StatusBadge status={recordStatusForBadge(row.status)} />
//                                                 </td>
//                                                 <td className="p-3 tabular-nums text-muted-foreground">
//                                                     {new Date(row.createdAt).toLocaleString(undefined, {
//                                                         dateStyle: "medium",
//                                                         timeStyle: "short",
//                                                     })}
//                                                 </td>
//                                                 <td className="p-1">
//                                                     <Link
//                                                         href={`/dashboard/review/${row.id}`}
//                                                         className="inline-flex cursor-pointer rounded-md border border-blue-500/25 bg-blue-500/10 px-2 py-1 text-sm text-blue-700 hover:bg-blue-500/15 dark:text-blue-300"
//                                                         aria-label="Review request"
//                                                     >
//                                                         <span className="hidden sm:inline">Review</span>
//                                                     </Link>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan={5} className="p-4">
//                                                 <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
//                                                     <p className="text-base font-medium text-muted-foreground">
//                                                         No pending record requests for this term.
//                                                     </p>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </section>
//             </CardContent>
//         </Card>
//     );
// }
