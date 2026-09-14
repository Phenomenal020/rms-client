"use client";

import { Card, CardContent } from "@/shadcn/ui/card";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";

// Constants for the dashboard loading skeletons: 
const CARD_COUNT = 4;
const TABLE_ROW_COUNT = 3;
type RequestsTableVariant = "org" | "user";

// Column count, minimum width, and cell class for each table variant
const TABLE_VARIANT_CONFIG = {
    org: { colCount: 5, minWidth: "min-w-[640px]", cellClass: "p-2" },
    user: { colCount: 4, minWidth: "min-w-[440px]", cellClass: "p-2 md:p-3" },
} as const;

// Function to generate the class for the table cell skeleton
function tableCellSkeletonClass(colIndex: number, colCount: number) {
    if (colIndex === colCount - 1) {
        return "ml-auto h-7 w-7 rounded-md sm:h-8 sm:w-16";
    } // Last column
    if (colIndex === 0) {
        return "h-3.5 w-[65%] sm:h-4 sm:w-[70%]";
    } // First column
    return "h-3.5 w-[55%] sm:h-4 sm:w-[60%]";
}

// Skeleton matching `DashboardCard` layout
export function DashboardCardsSkeleton({ count = CARD_COUNT }: { count?: number }) {
    return (
        <section
            className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4"
            aria-busy="true"
            aria-label="Loading stats"
        >
            {Array.from({ length: count }).map((_, index) => (
                <Card
                    key={index}
                    className="relative overflow-hidden border border-border bg-card"
                >
                    <CardContent className="p-3 sm:p-4">
                        <Skeleton className="h-8 w-12 sm:h-10 sm:w-16" />
                        <Skeleton className="mt-2 h-3.5 w-20 sm:h-4 sm:w-28" />
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

// skeleton matching Teacher Join Requests table
export function DashboardRequestsTableSkeleton({
    variant = "org",
    title,
    rows = TABLE_ROW_COUNT,
}: {
    variant?: RequestsTableVariant;
    title?: string;
    rows?: number;
}) {
    // Get the column count, minimum width, and cell class for the variant
    const { colCount, minWidth, cellClass } = TABLE_VARIANT_CONFIG[variant];

    return (
        <div className="space-y-2 sm:space-y-3" aria-busy="true" aria-label={title ?? "Loading requests"}>
            {/* If a title is provided, show the skeleton for the title */}
            {title ? (
                <Skeleton className="h-6 w-36 sm:h-7 sm:w-48" />
            ) : null}
            <div className="overflow-x-auto rounded-sm border border-border bg-card shadow-md">
                <table className={`${minWidth} w-full table-fixed border-collapse text-sm`}>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="border-b border-border last:border-b-0"
                            >
                                {Array.from({ length: colCount }).map((_, colIndex) => (
                                    <td key={colIndex} className={cellClass}>
                                        <Skeleton
                                            className={tableCellSkeletonClass(colIndex, colCount)}
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

// Generic dashboard loading shell:
export function DashboardLoading() {
    console.log("DashboardLoading");
    return (
        <div
            className="space-y-6 pb-4 sm:space-y-10 sm:pb-6"
            aria-busy="true"
            aria-label="Loading dashboard"
        >
            {/* Banner + dialog — renders only when session exists and 2FA is off */}
            <SecuritySetupModal />
            <DashboardCardsSkeleton />
            <DashboardRequestsTableSkeleton variant="org" title="Pending Requests" />
        </div>
    );
}