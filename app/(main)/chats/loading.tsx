import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card } from "@/shadcn/ui/card";

export default function ChatsLoading(): React.ReactElement {
    return (
        <main className="min-h-screen w-full bg-background px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto w-full max-w-6xl space-y-4">
                <Skeleton className="h-9 w-40" />
                <Card className="border shadow-md overflow-hidden h-[calc(100vh-10rem)] min-h-[520px]">
                    <div className="grid h-full md:grid-cols-[340px_1fr]">
                        <div className="border-r border-border p-4 space-y-3">
                            <Skeleton className="h-10 w-full" />
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Skeleton className="h-11 w-11 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hidden md:flex flex-col p-6 space-y-4">
                            <Skeleton className="h-12 w-64" />
                            <Skeleton className="h-16 w-2/3" />
                            <Skeleton className="h-16 w-1/2 ml-auto" />
                            <Skeleton className="h-16 w-3/5" />
                        </div>
                    </div>
                </Card>
            </div>
        </main>
    );
}
