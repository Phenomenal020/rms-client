"use client";

import { Card, CardContent } from "@/shadcn/ui/card";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";

const CARD_COUNT = 4;
const TABLE_ROW_COUNT = 5;

// Skeleton matching `DashboardCard` layout
export function DashboardCardsSkeleton({ count = CARD_COUNT }: { count?: number }) {
    return (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-busy="true" aria-label="Loading stats">
            {Array.from({ length: count }).map((_, index) => (
                <Card
                    key={index}
                    className="relative overflow-hidden border border-border bg-card"
                >
                    <CardContent className="p-4">
                        <Skeleton className="h-10 w-16" />
                        <Skeleton className="mt-2 h-4 w-28" />
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

type RequestsTableVariant = "org" | "user";
const ORG_HEADERS = ["Teacher", "Class", "Status", "Date & Time", ""] as const;
const USER_HEADERS = ["Class", "Status", "Date & Time", ""] as const;
// One pending-requests table skeleton (header + 3 rows)
export function DashboardRequestsTableSkeleton({
    variant = "org",
    title,
    rows = TABLE_ROW_COUNT,
}: {
    variant?: RequestsTableVariant;
    title?: string;
    rows?: number;
}) {
    const headers = variant === "org" ? ORG_HEADERS : USER_HEADERS;
    const colCount = headers.length;

    return (
        <div className="space-y-3" aria-busy="true" aria-label={title ?? "Loading requests"}>
            {title ? (
                <Skeleton className="h-7 w-48" />
            ) : null}
            <div className="overflow-x-auto rounded-sm border border-border bg-card shadow-md">
                <table className="min-w-[480px] w-full table-fixed border-collapse text-sm md:text-base">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            {headers.map((label, index) => (
                                <th
                                    key={`${label}-${index}`}
                                    className="p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground"
                                    aria-hidden={!label}
                                >
                                    {label || "\u00A0"}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="border-b border-border last:border-b-0"
                            >
                                {Array.from({ length: colCount }).map((_, colIndex) => (
                                    <td key={colIndex} className="p-3">
                                        <Skeleton
                                            className={
                                                colIndex === colCount - 1
                                                    ? "ml-auto h-8 w-16 rounded-md"
                                                    : colIndex === 0
                                                      ? "h-4 w-[70%]"
                                                      : "h-4 w-[60%]"
                                            }
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Skeleton rows only — for use inside an existing table body
export function DashboardRequestsTableRowsSkeleton({
    columns = 5,
    rows = TABLE_ROW_COUNT,
}: {
    columns?: number;
    rows?: number;
}) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border last:border-b-0">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="p-3">
                            <Skeleton
                                className={
                                    colIndex === columns - 1
                                        ? "ml-auto h-8 w-16 rounded-md"
                                        : colIndex === 0
                                          ? "h-4 w-[70%]"
                                          : "h-4 w-[60%]"
                                }
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

// Generic dashboard loading shell:
export function DashboardLoading() {
    return (
        <div className="space-y-10" aria-busy="true" aria-label="Loading dashboard">
            {/* Banner + dialog — renders only when session exists and 2FA is off */}
            <SecuritySetupModal />
            <DashboardCardsSkeleton />
            <DashboardRequestsTableSkeleton variant="org" title="Pending Requests" />
            <DashboardRequestsTableSkeleton variant="org" title="Recent Activity" />
        </div>
    );
}