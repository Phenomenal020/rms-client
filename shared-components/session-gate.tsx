// Page level gates to protected routes based on user role

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";

type SessionGateProps = {
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
};

export function SessionGate({
    children,
    fallback = null,
    redirectTo = "/sign-in",
}: SessionGateProps) {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const isAuthenticated = (!isLoading && user);

    useEffect(() => {
        // If the user does not have an active session, redirect to the sign in page
        if (!isLoading && !isAuthenticated) {
            router.replace(redirectTo);
        }
    }, [isLoading, isAuthenticated, router, redirectTo]);

    // If the user is still loading or does not have an active session, show the fallback component
    if (isLoading || !isAuthenticated) {
        return fallback;
    }

    return children;
}