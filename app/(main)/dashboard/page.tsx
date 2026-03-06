import { Card, CardContent } from "@/shadcn/ui/card"
import { Badge } from "@/shadcn/ui/badge"

export default function Dashboard() {

    // Dashboard card data
    const dashboardItems = [
        { title: "Enrolled Students", value: 142, sub: "Active staff" },
        { title: "Subjects Offered", value: 17, sub: "Registered" },
        { title: "Pending Requests", value: 4, sub: "Need action" },
        { title: "Approved Requests", value: 6, sub: "To review" },
    ]

    // Placeholder data
    const recentUploadRequests = [
        { teacher: "Mr. David Chen  David Chen  David Chen", status: "Accepted", date: "16 Feb 2025, 10:02 AM" },
        { teacher: "Ms. Priya Sharma", status: "Pending", date: "17 Feb 2025, 2:34 PM" },
        { teacher: "Dr. Amara Osei", status: "Pending", date: "18 Feb 2025, 9:11 AM" },
        { teacher: "Mr. David Chen", status: "Declined", date: "16 Feb 2025, 10:02 AM" },
        { teacher: "Ms. Priya Sharma", status: "Pending", date: "17 Feb 2025, 2:34 PM" },
        { teacher: "Dr. Amara Osei", status: "Pending", date: "18 Feb 2025, 9:11 AM" },
        { teacher: "Mr. David Chen", status: "Accepted", date: "16 Feb 2025, 10:02 AM" },
        { teacher: "Ms. Priya Sharma", status: "Pending", date: "17 Feb 2025, 2:34 PM" },
        { teacher: "Dr. Amara Osei", status: "Pending", date: "18 Feb 2025, 9:11 AM" },
    ]

    return (
        <main className="min-h-screen w-full bg-background px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto w-full max-w-5xl space-y-10">

                {/* Page Header */}
                <section className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Greenfield Academy · First Term 2024/2025
                    </p>
                </section>

                {/* Stats Card */}
                <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {dashboardItems.map((item) => (
                        <DashboardCard key={item.title} title={item.title} value={item.value} />
                    ))}
                </section>

                {/*  Divider  */}
                <hr className="border-border" />

                {/*  Recent Upload Requests  */}
                <section className="space-y-2 pb-6">

                    <h4 className="text-xl font-semibold tracking-tight text-foreground">
                        Recent Requests
                    </h4>

                    <div className="overflow-x-auto rounded-sm border border-border bg-card shadow-md">
                        <table className="min-w-[520px] w-full border-collapse text-sm md:text-base cursor-pointer">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground w-[45%]">
                                        Teacher
                                    </th>
                                    <th className="p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground w-[20%]">
                                        Status
                                    </th>
                                    <th className="p-3 text-left text-sm md:text-base font-semibold uppercase tracking-wider text-muted-foreground w-[35%]">
                                        Date &amp; Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Display recent upload requests here */}
                                {recentUploadRequests.length > 0 ? (
                                    recentUploadRequests.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/40"
                                        >
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Teacher's name */}
                                                    <span className="font-medium text-foreground">
                                                        {row.teacher.trim()}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Status badge */}
                                            <td className="p-3">
                                                <StatusBadge status={row.status} />
                                            </td>
                                            {/* Date & Time */}
                                            <td className="p-3 tabular-nums text-muted-foreground">
                                                {row.date}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="p-4">
                                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                                <p className="text-base font-medium text-muted-foreground">
                                                    No Recent Activity.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>

                </section>

            </div>
        </main>
    )
}


//  Stat card 
function DashboardCard({ title, value }: { title: string; value: number }) {
    return (
        <Card className="relative overflow-hidden border border-border bg-card transition-colors hover:bg-accent/50 cursor-pointer">
            <CardContent className="p-4">
                <p className="text-4xl font-bold tracking-tight text-foreground">{value}</p>
                <p className="mt-1 text-sm md:text-base font-bold text-foreground/60">{title}</p>
            </CardContent>
        </Card>
    )
}

// Status badge 
function StatusBadge({ status }: { status: string }) {
    if (status === "Accepted") {
        return (
            <Badge className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-sm md:text-base font-semibold text-emerald-700 shadow-none hover:bg-emerald-500/15 dark:text-emerald-300">
                {status}
            </Badge>
        )
    }

    if (status === "Pending") {
        return (
            <Badge className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-sm md:text-base font-semibold text-amber-700 shadow-none hover:bg-amber-500/15 dark:text-amber-300">
                {status}
            </Badge>
        )
    }

    if (status === "Declined") {
        return (
            <Badge className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-0.5 text-sm md:text-base font-semibold text-rose-700 shadow-none hover:bg-rose-500/15 dark:text-rose-300">
                {status}
            </Badge>
        )
    }

    // Pending
    return (
        <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 text-sm md:text-base font-semibold text-muted-foreground"
        >
            {status}
        </Badge>
    )
}
