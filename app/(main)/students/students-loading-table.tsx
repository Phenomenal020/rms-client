import { Skeleton } from "@/shadcn/ui/skeleton";

const LOADING_ROW_COUNT = 6;

export function StudentsLoadingTable() {
    return (
        <div className="overflow-x-auto py-2">
            <table className="min-w-[400px] w-full border-collapse text-sm lg:text-base text-left">
                <colgroup>
                    <col className="w-[8%]" />
                    <col className="w-[32%]" />
                    <col className="w-[22%]" />
                    <col className="w-[14%]" />
                    <col className="w-[24%]" />
                </colgroup>
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="p-2 font-semibold text-muted-foreground">S/N</th>
                        <th className="p-2 font-semibold text-muted-foreground">Student</th>
                        <th className="p-2 font-semibold text-muted-foreground">Class</th>
                        <th className="p-2 font-semibold text-muted-foreground">Gender</th>
                        <th className="p-2 font-semibold text-muted-foreground text-right" />
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: LOADING_ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-4 w-5" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-4 w-[70%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-4 w-[60%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-4 w-16" />
                            </td>
                            <td className="p-2 text-right">
                                <div className="flex justify-end gap-1">
                                    <Skeleton className="h-6 w-12 rounded-md" />
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
