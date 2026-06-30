import type { ReactNode } from "react";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";

const ROW_COUNT = 3;

// Term setup table skeleton
export function TermSetupTableSkeleton() {
    return (
        <div className="overflow-x-auto py-3">
            <table className="min-w-[480px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="py-2 pr-1 font-semibold text-muted-foreground">Session</th>
                        <th className="py-2 pr-1 font-semibold text-muted-foreground">Term</th>
                        <th className="py-2 pr-1 font-semibold text-muted-foreground">Start Date</th>
                        <th className="py-2 pr-1 font-semibold text-muted-foreground">End Date</th>
                        <th className="py-2 pr-1 font-semibold text-muted-foreground">Days</th>
                        <th className="py-2" />
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="py-2 pr-1"><Skeleton className="h-4 w-[80%]" /></td>
                            <td className="py-2 pr-1"><Skeleton className="h-4 w-[70%]" /></td>
                            <td className="py-2 pr-1"><Skeleton className="h-4 w-[75%]" /></td>
                            <td className="py-2 pr-1"><Skeleton className="h-4 w-[75%]" /></td>
                            <td className="py-2 pr-1"><Skeleton className="h-4 w-8" /></td>
                            <td className="py-2"><Skeleton className="ml-auto h-6 w-12 rounded-md" /></td>
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
        <div className="overflow-x-auto py-2">
            <table className="min-w-[240px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="py-2 pr-2 font-semibold text-muted-foreground">Grade</th>
                        <th className="py-2 pr-2 font-semibold text-muted-foreground">Min Score</th>
                        <th className="py-2 pr-2 font-semibold text-muted-foreground">Max Score</th>
                        <th className="py-2" />
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="py-2 pr-2"><Skeleton className="h-4 w-10" /></td>
                            <td className="py-2 pr-2"><Skeleton className="h-4 w-8" /></td>
                            <td className="py-2 pr-2"><Skeleton className="h-4 w-10" /></td>
                            <td className="py-2"><Skeleton className="ml-auto h-6 w-16 rounded-md" /></td>
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
        <div className="overflow-x-auto py-2">
            <table className="min-w-[320px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="py-2 pr-2 font-semibold text-muted-foreground">Type</th>
                        <th className="py-2 pr-2 font-semibold text-muted-foreground">Percentage</th>
                        <th className="py-2 pr-2 font-semibold text-muted-foreground">Order</th>
                        <th className="py-2" />
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="py-2 pr-2"><Skeleton className="h-4 w-[70%]" /></td>
                            <td className="py-2 pr-2"><Skeleton className="h-4 w-12" /></td>
                            <td className="py-2 pr-2"><Skeleton className="h-4 w-8" /></td>
                            <td className="py-2"><Skeleton className="ml-auto h-6 w-16 rounded-md" /></td>
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