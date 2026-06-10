// A badge component for the dashboard
import { Badge } from "@/shadcn/ui/badge";

export function StatusBadge({ status }: { status: string }) {
    if (status === "Accepted") {
        return (
            <Badge className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-sm md:text-base font-semibold text-emerald-700 shadow-none hover:bg-emerald-500/15 dark:text-emerald-300">
                {status}
            </Badge>
        );
    }

    if (status === "Pending") {
        return (
            <Badge className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-sm md:text-base font-semibold text-amber-700 shadow-none hover:bg-amber-500/15 dark:text-amber-300">
                {status}
            </Badge>
        );
    }

    if (status === "Declined") {
        return (
            <Badge className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-0.5 text-sm md:text-base font-semibold text-rose-700 shadow-none hover:bg-rose-500/15 dark:text-rose-300">
                {status}
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 text-sm md:text-base font-semibold text-muted-foreground"
        >
            {status}
        </Badge>
    );
}
