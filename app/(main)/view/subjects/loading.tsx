"use client";

import { Card, CardContent } from "@/shadcn/ui/card";
import { Skeleton } from "@/shadcn/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">

                {/* Print/Export Header Skeleton */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <Skeleton className="h-7 w-36" />
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-28" />
                        </div>
                    </div>
                </div>

                {/* Subject Selection Skeleton */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-10 w-48 sm:w-64" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-9" />
                                <Skeleton className="h-9 w-9" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subject Sheet Skeleton */}
                <Card>
                    <CardContent className="p-8">

                        {/* School Header Skeleton */}
                        <div className="text-center mb-8 border-b-2 border-border pb-6 space-y-2">
                            <Skeleton className="h-8 w-64 mx-auto" />
                            <Skeleton className="h-5 w-48 mx-auto" />
                            <Skeleton className="h-4 w-56 mx-auto" />
                            <Skeleton className="h-7 w-52 mx-auto mt-3" />
                            <Skeleton className="h-4 w-44 mx-auto" />
                        </div>

                        {/* Subject Info Skeleton */}
                        <div className="mb-6 space-y-2">
                            <Skeleton className="h-5 w-64" />
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-5 w-full" />
                                ))}
                            </div>
                        </div>

                        {/* Subject Result Table Skeleton */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-9 w-16" />
                            </div>
                            {/* Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-muted p-3">
                                    <div className="grid grid-cols-5 gap-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Skeleton key={i} className="h-4 w-full" />
                                        ))}
                                    </div>
                                </div>
                                {[...Array(6)].map((_, rowIndex) => (
                                    <div key={rowIndex} className="p-3 border-t">
                                        <div className="grid grid-cols-5 gap-2">
                                            {[...Array(5)].map((_, colIndex) => (
                                                <Skeleton key={colIndex} className="h-4 w-full" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subject Stats Skeleton */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
