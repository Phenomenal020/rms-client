"use client";

import { SecuritySetupModal } from "@/shared-components/security-setup-modal"
import { DashboardCard } from "./dashboard-card"
import { OrgDashboard } from "./org-dashboard"
import { AdminDashboard } from "./admin-dashboard"
import { UserDashboard } from "./user-dashboard"
import { useUser } from "@/contexts/user-context";
import { SchoolAndTermMgt } from "@/shared-components/school-and-term-mgt";
import { getOrganisationDashboard } from "@/fetcher/queries";

export default function Dashboard() {
    // Get user from User context
    const { user } = useUser();

    // Check if the user is an admin or org admin
    const isAdmin = user?.role === "admin";
    const isOrgAdmin = user?.role === "orgadmin";
    const isUser = user?.role === "user";
    const { data: dashboardStats } = getOrganisationDashboard();

    // Dashboard card data
    const dashboardItems = [
        { title: "Enrolled Students", value: dashboardStats.enrolledStudents },
        { title: "Subjects Offered", value: dashboardStats.subjectsOffered },
        { title: "Pending Requests", value: dashboardStats.pendingRequests },
        { title: "Approved Requests", value: dashboardStats.approvedRequests },
    ]

    return (
        <main className="min-h-screen w-full bg-background px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto w-full max-w-5xl space-y-10">
                {/* Page Header */}

                {/* Security setup modal — shown once if 2FA is not yet enabled */}
                <SecuritySetupModal />


                {isAdmin && <section className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome, {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage users in your application
                    </p>
                </section>}

                {isOrgAdmin && (<SchoolAndTermMgt />)}

                {/* Stats Card */}
                {isOrgAdmin && (
                    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {dashboardItems.map((item) => (
                            <DashboardCard key={item.title} title={item.title} value={item.value} />
                        ))}
                    </section>)}

                {/*  Divider  */}
                <hr className="border-border" />

                {/* Organisation admin dashboard */}
                {/* {isOrgAdmin && <OrgDashboard />} */}

                {/* Admin dashboard */}
                {isAdmin && <AdminDashboard />}

                {/* {isUser && <UserDashboard />} */}
                {isOrgAdmin && <UserDashboard />}


            </div>
        </main>
    )
}