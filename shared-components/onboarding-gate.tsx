// Page level gates to redirect users based on their onboarding status
"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";

type OnboardingGateProps = {
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
};

export function OnboardingGate({
    children,
    fallback = <OnboardingLoading />,
    redirectTo = "/dashboard",
}: OnboardingGateProps) {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const onboardingStatus = user?.onboardingStatus;
    const isOnboarded = onboardingStatus === "APPROVED";
    const isUnauthenticated = !isLoading && !user;

    useEffect(() => {
        // if loading, do nothing (stay on the page)
        if (isLoading) return;

        // if no valid session (finished loading and no user), redirect to sign-in
        // if (!user) {
        //     router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
        //     return;
        // }

        // Already onboarded — leave onboarding
        if (isOnboarded) {
            router.replace(redirectTo);
        }
    }, [user, isLoading, isOnboarded, router, redirectTo, pathname]);

    // Loading, missing user (redirecting to sign-in), or already onboarded
    if (isLoading || isUnauthenticated || isOnboarded) {
        return fallback;
    }

    return children;
}

// Loading skeleton that mirrors the onboarding form shell
export function OnboardingLoading() {
    return (
        <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
            <div className="w-full max-w-xl">
                {/* Header skeleton*/}
                <header className="mb-6 flex flex-col items-center gap-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-8 w-72 max-w-full sm:h-9" />
                </header>

                {/* Progress bar skeleton */}
                <div className="mb-6 flex items-start" aria-hidden>
                    {[0, 1, 2].map((index) => (
                        <div key={index} className="relative flex flex-1 flex-col items-center gap-2">
                            {index < 2 && (
                                <div className="absolute top-[18px] left-[calc(50%+22px)] right-[calc(-50%+22px)] h-0.5 bg-border" />
                            )}
                            <Skeleton className="relative z-10 size-9 rounded-full" />
                            <Skeleton className="hidden h-3 w-16 sm:block" />
                        </div>
                    ))}
                </div>

                {/* Card skeleton */}
                <Card className="border shadow-md">
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-56" />
                            <Skeleton className="h-4 w-80 max-w-full" />
                        </div>

                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}

                        <div className="mt-8 flex items-center justify-between gap-3">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}