import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";
import { StudentsLoadingTable } from "./students-loading-table";

export default function StudentsLoading() {
    return (
        <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto w-full max-w-5xl space-y-10">
                <Card className="border shadow-md">
                    <CardContent className="space-y-6">
                        <section className="overflow-hidden rounded-sm bg-card">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Skeleton className="h-6 w-36" />
                                {/* search bar and add student button */}
                                <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                                    <Skeleton className="h-6 w-full sm:max-w-xs" />
                                    <Skeleton className="h-6 w-32" />
                                </div>
                            </div>

                            <hr className="my-4" />

                            <StudentsLoadingTable />
                        </section>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
