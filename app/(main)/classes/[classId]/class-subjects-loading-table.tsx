import { Skeleton } from "@/shadcn/ui/skeleton";

const LOADING_ROW_COUNT = 5;

export function ClassSubjectsLoadingTable() {
    return (
        <div className="overflow-x-auto rounded-md border border-border" aria-busy="true" aria-label="Loading subject assignments">
            <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Subject</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Subject teacher</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: LOADING_ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-t border-border">
                            <td className="px-4 py-3">
                                <Skeleton className="h-4 w-28 sm:w-36" />
                            </td>
                            <td className="px-4 py-3">
                                <Skeleton className="h-10 w-full min-w-[12rem] max-w-xs" />
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Skeleton className="ml-auto h-8 w-20 rounded-md" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
