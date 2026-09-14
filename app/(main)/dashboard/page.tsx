"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { DashboardCard } from "./helpers/dashboard-card";
import { DashboardLoading } from "./helpers/dashboard-loading";
import { AdminDashboard } from "./admin/admin-dashboard";
import { UserDashboard } from "./user/user-dashboard";
import { OrgDashboard } from "./orgadmin/org-dashboard";
import { useUser } from "@/contexts/user-context";
import { getOrganisationDashboard } from "@/fetcher/queries";
import { authClient } from "@/src/auth-client";

export default function Dashboard() {
    // hooks for redirection
    const router = useRouter();
    // Get user from User context
    const { user, isLoading: isUserLoading, error: userError } = useUser();

    // Check if the user is an admin or org admin
    const isAdmin = user?.role === "admin";
    const isOrgAdmin = user?.role === "orgadmin";
    const isUser = user?.role === "user";

    // Active organisation — required before using the dashboard
    const { data: activeOrganization, isPending: isActiveOrganizationPending, error: activeOrganizationError } = authClient.useActiveOrganization();
    const hasActiveOrg = !isActiveOrganizationPending && !!activeOrganization;

    console.log("user active organisation", activeOrganization);

    // Get dashboard stats (for the cards)
    const { data: dashboardStats, isLoading: isDashboardStatsLoading } = getOrganisationDashboard(
        !isAdmin && hasActiveOrg,
    );

    // Redirect non-platform admin users without an active organisation to onboarding
    // If they are not even authenticated, SessionGate on layout will redirect them to the sign-in page.
    // Therefore, it's safe to assume that at this point, the user is already authenticated.
    useEffect(() => {
        if (isActiveOrganizationPending) return; // stay while waiting for the active organisation to load
        if (isAdmin) return; // if the user is an admin, stay. No redirect needed. Stay.
        if (!isUserLoading && !isActiveOrganizationPending && !activeOrganization) router.replace("/onboarding");  // at this point, if the user is not an admin and has no active organisation, redirect to onboarding
    }, [isActiveOrganizationPending, isAdmin, activeOrganization, router]);

    // Non admins: never show dashboard skeleton until the active organisation is loaded
    if (!isAdmin && isActiveOrganizationPending) return null;

    // If they do nothave an active organisation, return null
    // Gate the dashboard content while redirecting to onboarding
    if (!isAdmin && !activeOrganization) return null;

    // If the the active organisation is pending, or the user is not an admin and the dashboard stats are loading, show the loading screen
    if (!isAdmin && isDashboardStatsLoading) {
        return (
            <main className="min-h-screen w-full bg-background px-4 py-6 md:px-6 md:py-10">
                <div className="mx-auto w-full max-w-5xl">
                    <DashboardLoading />
                </div>
            </main>
        );
    }

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

                {/* Welcome title: Everyone gets a welcome! */}
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Welcome, {user ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1) : ''}
                </h1>


                {/* ----------ADMIN DASHBOARD ------------ */}
                {/* Manage users: admins */}
                {isAdmin && <><section className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Manage users in your application
                    </p>
                </section>
                    <AdminDashboard />
                </>}


                {/* ----------ORGANISATION ADMIN & USER DASHBOARD ------------ */}
                {/* Stats Card: orgadmins and users*/}
                {(isOrgAdmin || isUser) && (
                    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {dashboardItems.map((item) => (
                            <DashboardCard key={item.title} title={item.title} value={item.value} />
                        ))}
                    </section>)}


                {/* ---------- ORGADMIN ONLY ORGANISATION DASHBOARD ------------ */}
                {isOrgAdmin && <OrgDashboard />}


                {/* ----------USER ONLY DASHBOARD ------------ */}
                {isUser && <UserDashboard />}

            </div>
        </main>
    )
}