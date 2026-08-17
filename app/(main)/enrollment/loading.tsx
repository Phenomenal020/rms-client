import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";
import { EnrollmentLoadingTable } from "./enrollment-loading-table";

export default function EnrollmentLoading() {
    return (
        <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto w-full max-w-5xl space-y-10">
                <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Enrollment</h1>
                        <Skeleton className="h-4 w-24" />
                    </div>
                </section>

                <Card className="border shadow-md">
                    <CardContent className="space-y-6">
                        <section className="overflow-hidden rounded-sm bg-card">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-10 md:h-12 w-full sm:max-w-xs" />
                            </div>

                            <hr className="my-4" />

                            <EnrollmentLoadingTable />
                        </section>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
