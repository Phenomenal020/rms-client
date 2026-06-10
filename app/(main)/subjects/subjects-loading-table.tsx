import { Skeleton } from "@/shadcn/ui/skeleton";

// Number of rows to display in the loading table
const LOADING_ROW_COUNT = 6;

export function SubjectsLoadingTable() {
    return (
        <div className="overflow-x-auto py-4">
            <table className="min-w-[300px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                <colgroup>
                    <col className="w-[10%]" />
                    <col className="w-[45%]" />
                    <col className="w-[25%]" />
                    <col className="w-[20%]" />
                </colgroup>
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="py-2 text-left font-semibold text-muted-foreground">S/N</th>
                        <th className="py-2 text-left font-semibold text-muted-foreground">Subject</th>
                        <th className="py-2 text-left font-semibold text-muted-foreground">Department</th>
                        <th className="py-2" />
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: LOADING_ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="py-2">
                                <Skeleton className="h-4 w-5" />
                            </td>
                            <td className="py-2">
                                <Skeleton className="h-4 w-[70%]" />
                            </td>
                            <td className="py-2">
                                <Skeleton className="h-4 w-20" />
                            </td>
                            <td className="py-2">
                                <div className="flex justify-end">
                                    <Skeleton className="h-6 w-14 rounded-md" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
