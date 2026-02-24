"use client";

import { Card, CardContent } from "@/shadcn/ui/card";
import { Skeleton } from "@/shadcn/ui/skeleton";

export function ResultsSkeleton() {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto">

                {/* Print/Export Header Skeleton */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <Skeleton className="h-7 w-48" />
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-28" />
                        </div>
                    </div>
                </div>

                {/* Student Selection Skeleton */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <Skeleton className="h-10 w-48 sm:w-64" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-9" />
                                <Skeleton className="h-9 w-9" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Result Sheet Skeleton */}
                <Card>
                    <CardContent className="p-8">

                        {/* School Header Skeleton */}
                        <div className="text-center mb-8 border-b-2 border-border pb-6 space-y-2">
                            <Skeleton className="h-8 w-64 mx-auto" />
                            <Skeleton className="h-5 w-48 mx-auto" />
                            <Skeleton className="h-4 w-56 mx-auto" />
                            <Skeleton className="h-3 w-40 mx-auto" />
                            <Skeleton className="h-7 w-52 mx-auto mt-3" />
                            <Skeleton className="h-4 w-44 mx-auto" />
                        </div>

                        {/* Student Stats Skeleton */}
                        <div className="mb-6">
                            <Skeleton className="h-6 w-48 mb-3" />
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-5 w-full" />
                                ))}
                            </div>
                        </div>

                        {/* Result Table Skeleton */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-9 w-16" />
                            </div>
                            {/* Table Header */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-muted p-3">
                                    <div className="grid grid-cols-6 gap-2">
                                        {[...Array(6)].map((_, i) => (
                                            <Skeleton key={i} className="h-4 w-full" />
                                        ))}
                                    </div>
                                </div>
                                {/* Table Rows */}
                                {[...Array(5)].map((_, rowIndex) => (
                                    <div key={rowIndex} className="p-3 border-t">
                                        <div className="grid grid-cols-6 gap-2">
                                            {[...Array(6)].map((_, colIndex) => (
                                                <Skeleton key={colIndex} className="h-4 w-full" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Signatures Skeleton */}
                        <div className="grid grid-cols-2 gap-8 mt-8">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-px w-full bg-border" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-px w-full bg-border" />
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
