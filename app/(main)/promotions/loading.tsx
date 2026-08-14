import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";
import { PromotionsLoadingTable } from "./promotions-loading-table";

export default function PromotionsLoading(): React.ReactElement {
    return (
        <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto w-full max-w-5xl space-y-10">
                <section className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-72" />
                </section>

                <Card className="border shadow-md">
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-10 md:h-12 w-full sm:max-w-xs" />
                        </div>
                        <hr className="border-border" />
                        <PromotionsLoadingTable />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
