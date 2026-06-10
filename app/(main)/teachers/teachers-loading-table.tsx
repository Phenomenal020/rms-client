import { Skeleton } from "@/shadcn/ui/skeleton";

const LOADING_ROW_COUNT = 4;

export function TeachersLoadingTable() {
    return (
        <div className="overflow-x-auto py-3">
            <table className="min-w-[300px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                <colgroup>
                    <col className="w-[40%]" />
                    <col className="w-[48%]" />
                    <col className="w-[12%]" />
                </colgroup>
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="p-2 text-left font-semibold text-muted-foreground">Name</th>
                        <th className="p-2 text-left font-semibold text-muted-foreground">Email</th>
                        <th className="p-2 text-right font-semibold text-muted-foreground" />
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: LOADING_ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-4 w-[70%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-4 w-[85%]" />
                            </td>
                            <td className="p-2">
                                <div className="flex justify-end">
                                    <Skeleton className="h-6 w-16 rounded-md" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
