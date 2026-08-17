import { Skeleton } from "@/shadcn/ui/skeleton";

// Number of rows to display in the loading table
const LOADING_ROW_COUNT = 6;

export function ClassesLoadingTable() {
    return (
        <div className="overflow-x-auto py-2">
            <table className="table-fixed min-w-[480px] w-full border-collapse text-sm lg:text-base text-left">
                {/* Table Columns: S/N, Class, Class Teacher, Subjects, Actions */}
                <colgroup>
                <col className="w-[8%]" />
                <col className="w-[20%]" />
                <col className="w-[32%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                </colgroup>
                {/* Table Header Row: S/N, Class, Class Teacher, Subjects, Actions */}
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="p-2 font-semibold text-muted-foreground">S/N</th>
                        <th className="p-2 font-semibold text-muted-foreground">Class</th>
                        <th className="p-2 font-semibold text-muted-foreground">Class Teacher</th>
                        <th className="p-2 font-semibold text-muted-foreground">Subjects</th>
                        <th className="p-2 font-semibold text-muted-foreground text-right" />
                    </tr>
                </thead>
                {/* Table Body: Rows of loading skeletons */}
                <tbody>
                    {Array.from({ length: LOADING_ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-4 w-5" />
                            </td>
                            <td className="max-w-0 p-2">
                                <Skeleton className="h-4 w-[70%]" />
                            </td>
                            <td className="max-w-0 p-2">
                                <Skeleton className="h-4 w-[80%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-8 w-14 rounded-md" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
