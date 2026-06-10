import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";
import { EnrollmentLoadingTable } from "./enrollment-loading-table";

export default function EnrollmentLoading() {
    return (
        <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto w-full max-w-5xl space-y-10">
                <Card className="border shadow-md">
                    <CardContent className="space-y-6">
                        <section className="overflow-hidden rounded-sm bg-card">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-base md:text-lg font-semibold text-foreground">Class</p>
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
