import { Skeleton } from "@/shadcn/ui/skeleton";

const LOADING_ROW_COUNT = 3;

export function StudentsLoadingTable() {
    return (
        <div className="overflow-x-auto py-3" aria-busy="true" aria-label="Loading students">
            <table className="min-w-[400px] w-full border-collapse text-sm text-left lg:text-base">
                <tbody>
                    {Array.from({ length: LOADING_ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-5 sm:h-4 sm:w-6" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[65%] sm:h-4 sm:w-[70%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[55%] sm:h-4 sm:w-[60%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-12 sm:h-4 sm:w-16" />
                            </td>
                            <td className="p-2 text-right">
                                <div className="flex justify-end gap-1">
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-12" />
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-14" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
