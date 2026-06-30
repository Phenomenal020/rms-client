// Page level gates to protected routes based on user role

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";

type OrgAdminGateProps = {
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
};

export function OrgAdminGate({
    children,
    fallback = null,
    redirectTo = "/dashboard",
}: OrgAdminGateProps) {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const isOrgAdmin = user?.role === "orgadmin";

    useEffect(() => {
        // If the user is not an organisation admin, redirect to the dashboard
        if (!isLoading && !isOrgAdmin) {
            router.replace(redirectTo);
        }
    }, [isLoading, isOrgAdmin, router, redirectTo]);

    // If the user is still loading or not an organisation admin, show the fallback component
    if (isLoading || !isOrgAdmin) {
        return fallback;
    }

    return children;
}
