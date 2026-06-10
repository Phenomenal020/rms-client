import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";
import { ClassesLoadingTable } from "./classes-loading-table";

export default function ClassesLoading() {
    return (
        <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto w-full max-w-5xl space-y-10">
                {/* Page Header
                <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <Skeleton className="h-9 w-36" />
                        <Skeleton className="h-4 w-52" />
                    </div>
                </section> */}

                {/* Main Card */}
                <Card className="border shadow-md">
                    <CardContent className="space-y-6">
                        <section className="overflow-hidden rounded-sm bg-card">
                            {/* Header: count + search + add */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Skeleton className="h-6 w-36" />
                                <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                                    <Skeleton className="h-10 md:h-12 w-full sm:max-w-xs" />
                                    <Skeleton className="h-10 md:h-12 w-28" />
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* Simply reuse the existing loading table skeleton from classes-form.tsx: */}
                            <ClassesLoadingTable />
                        </section>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}