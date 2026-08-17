import { Skeleton } from "@/shadcn/ui/skeleton";

const LOADING_ROW_COUNT = 6;

export function EnrollmentLoadingTable() {
    return (
        <div className="overflow-x-auto py-2">
            <table className="table-fixed min-w-[360px] w-full border-collapse text-sm lg:text-base text-left">
                <colgroup>
                    <col className="w-[10%]" />
                    <col className="w-[46%]" />
                    <col className="w-[34%]" />
                    <col className="w-[10%]" />
                </colgroup>
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="p-2 font-semibold text-muted-foreground">S/N</th>
                        <th className="p-2 font-semibold text-muted-foreground">Student</th>
                        <th className="p-2 font-semibold text-muted-foreground">Enrolled Subjects</th>
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
