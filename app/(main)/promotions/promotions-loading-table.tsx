import { Skeleton } from "@/shadcn/ui/skeleton";

export function PromotionsLoadingTable(): React.ReactElement {
    return (
        <div className="overflow-x-auto py-3">
            <table className="min-w-[560px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="p-2"><Skeleton className="h-4 w-8" /></th>
                        <th className="p-2"><Skeleton className="h-4 w-32" /></th>
                        <th className="p-2"><Skeleton className="h-4 w-16" /></th>
                        <th className="p-2 text-right"><Skeleton className="h-4 w-20 ml-auto" /></th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2"><Skeleton className="h-4 w-6" /></td>
                            <td className="p-2"><Skeleton className="h-4 w-full" /></td>
                            <td className="p-2"><Skeleton className="h-4 w-16" /></td>
                            <td className="p-2 flex justify-end"><Skeleton className="h-8 w-8 rounded-full" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
