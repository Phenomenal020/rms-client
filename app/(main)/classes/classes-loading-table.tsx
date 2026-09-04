import { Skeleton } from "@/shadcn/ui/skeleton";

const LOADING_ROW_COUNT = 3;

export function ClassesLoadingTable() {
    return (
        <div className="overflow-x-auto py-3" aria-busy="true" aria-label="Loading classes">
            <table className="min-w-[500px] w-full table-fixed border-collapse text-sm text-left">
                <tbody>
                    {Array.from({ length: LOADING_ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-5 sm:h-4 sm:w-6" />
                            </td>
                            <td className="max-w-0 p-2">
                                <Skeleton className="h-3.5 w-[65%] sm:h-4 sm:w-[70%]" />
                            </td>
                            <td className="max-w-0 p-2">
                                <Skeleton className="h-3.5 w-[70%] sm:h-4 sm:w-[80%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-6 w-20 rounded-full sm:w-24" />
                            </td>
                            <td className="p-2">
                                <div className="flex items-center justify-end gap-1">
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-14" />
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
