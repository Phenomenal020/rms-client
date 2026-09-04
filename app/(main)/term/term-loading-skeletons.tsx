import type { ReactNode } from "react";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";

const ROW_COUNT = 3;

// Term setup table skeleton
export function TermSetupTableSkeleton() {
    return (
        <div className="overflow-x-auto py-3" aria-busy="true" aria-label="Loading terms">
            <table className="min-w-[560px] w-full table-fixed border-collapse text-sm text-left md:text-base">
                <tbody>
                    {Array.from({ length: ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[75%] sm:h-4 sm:w-[80%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[65%] sm:h-4 sm:w-[70%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[70%] sm:h-4 sm:w-[75%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[70%] sm:h-4 sm:w-[75%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-6 sm:h-4 sm:w-8" />
                            </td>
                            <td className="p-2">
                                <div className="flex items-center justify-end gap-1">
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-14" />
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-14" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Grading system table skeleton
export function GradingTableSkeleton() {
    return (
        <div className="overflow-x-auto py-3" aria-busy="true" aria-label="Loading grading system">
            <table className="min-w-[240px] w-full table-fixed border-collapse text-sm text-left md:text-base">
                <tbody>
                    {Array.from({ length: ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-8 sm:h-4 sm:w-10" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-6 sm:h-4 sm:w-8" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-8 sm:h-4 sm:w-10" />
                            </td>
                            <td className="p-2">
                                <div className="flex items-center justify-end gap-1">
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-14" />
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-14" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Assessment structure table skeleton
export function AssessmentTableSkeleton() {
    return (
        <div className="overflow-x-auto py-3" aria-busy="true" aria-label="Loading assessment structure">
            <table className="min-w-[320px] w-full table-fixed border-collapse text-sm text-left md:text-base">
                <tbody>
                    {Array.from({ length: ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[65%] sm:h-4 sm:w-[70%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-10 sm:h-4 sm:w-12" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-6 sm:h-4 sm:w-8" />
                            </td>
                            <td className="p-2">
                                <div className="flex items-center justify-end gap-1">
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-14" />
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-14" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Wrapper skeleton component
function CardShellSkeleton({
    title,
    table,
}: {
    title: string;
    table: ReactNode;
}) {
    return (
        <Card className="border shadow-md">
            <CardContent className="space-y-4">
                <section className="overflow-hidden rounded-sm bg-card">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-base md:text-lg font-semibold text-foreground">{title}</p>
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <hr className="my-3" />
                    {table}
                    <div className="flex justify-center gap-2 w-full mt-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </section>
            </CardContent>
        </Card>
    );
}

// Overall skeleton component for the /term route
export function TermRouteSkeleton() {
    return (
        <>
            <section className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Term Setup</h1>
                    <Skeleton className="h-4 w-36" />
                </div>
            </section>
            <CardShellSkeleton title="Term" table={<TermSetupTableSkeleton />} />
            <CardShellSkeleton title="Assessment Structure" table={<AssessmentTableSkeleton />} />
            <CardShellSkeleton title="Grading System" table={<GradingTableSkeleton />} />
        </>
    );
}