import { Skeleton } from "@/shadcn/ui/skeleton";

const LOADING_ROW_COUNT = 3;

export function TeachersLoadingTable() {
    return (
        <div className="overflow-x-auto py-3" aria-busy="true" aria-label="Loading teachers">
            <table className="min-w-[300px] w-full table-fixed border-collapse text-sm text-left">
                <tbody>
                    {Array.from({ length: LOADING_ROW_COUNT }).map((_, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[65%] sm:h-4 sm:w-[70%]" />
                            </td>
                            <td className="p-2">
                                <Skeleton className="h-3.5 w-[75%] sm:h-4 sm:w-[85%]" />
                            </td>
                            <td className="p-2">
                                <div className="flex justify-end">
                                    <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-16" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
