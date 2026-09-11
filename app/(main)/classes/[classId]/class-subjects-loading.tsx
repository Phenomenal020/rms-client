import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";
import { ClassSubjectsLoadingTable } from "./class-subjects-loading-table";

export default function ClassSubjectsLoading() {
    return (
        <main className="min-h-screen w-full bg-background px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <section className="space-y-3">
                    {/* Back button placeholder */}
                    <Skeleton className="h-9 w-36" />

                    {/* Class name and form teacher placeholder */}
                    <div className="space-y-2">
                        <Skeleton className="h-9 w-48 sm:w-64" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </section>

                {/* Subject teacher assignments card */}
                <Card className="border shadow-md">
                    <CardContent className="space-y-4 p-4 md:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-52 sm:w-64" />
                                <Skeleton className="h-4 w-full max-w-md" />
                            </div>
                            <Skeleton className="h-6 w-10 rounded-full" />
                        </div>

                        <ClassSubjectsLoadingTable />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
