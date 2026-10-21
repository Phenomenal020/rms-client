// Page level gates to redirect users based on their onboarding status
"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";
import { USER_WITH_RELATIONS_KEY } from "@/fetcher/keys";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { getUserWithRelations } from "@/fetcher/queries";
import { ErrorBanner } from "@/shared-components/error-banner";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { mutate } from "swr";

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
    // Get the user and their onboarding status
    const { user, isLoading, error: fetchError } = getUserWithRelations();
    const router = useRouter();
    const pathname = usePathname();
    const isOnboarded = user?.onboardingStatus === "APPROVED";

    // If there is an error, check if it is a 401/403 error
    const fetchStatus = fetchError ? getHttpStatus(fetchError) : undefined;

    // Fetch failure: non 401/403 error
    const isFetchFailure = !!fetchError && fetchStatus !== 401 && fetchStatus !== 403;

    // User is unauthenticated if the component is not loading, there is no user, and there is no fetch failure (only 401/403 errors)
    const isUnauthenticated = !isLoading && !user && !isFetchFailure;

    useEffect(() => {
        // If the component is still loading, do nothing
        if (isLoading) return;

        // Auth errors first; other fetch errors stay on page --> ErrorBanner
        if (fetchError) {
            if (handleAuthRedirect(fetchError, { router, pathname })) return;  // redirect to sign-in if 401/403
            if (isFetchFailure) return;  // if not 401/403, do nothing
        }

        // If component is not laading, there is no error, and there is no user, redirect to sign-in
        if (!user) {
            router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        // If the user is onboarded and (not loading, no error, and actual user), redirect to the redirectTo path
        if (isOnboarded) {
            router.replace(redirectTo);
        }
    }, [user, isLoading, fetchError, isFetchFailure, isOnboarded, router, redirectTo, pathname]);

    // If there is a fetch failure (non 401/403 error), show the error banner
    if (isFetchFailure) {
        return (
            <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
                <div className="w-full max-w-2xl">
                    <ErrorBanner
                        title="Could not load your account"
                        message={getApiErrorMessage(
                            fetchError,
                            "Something went wrong while loading your profile. Please try again.",
                        )}
                        onRetry={() => void mutate(USER_WITH_RELATIONS_KEY)}
                    />
                </div>
            </main>
        );
    }

    // If the component is loading, the user is unauthenticated, or the user is onboarded, show the fallback (loading skeleton)
    if (isLoading || isUnauthenticated || isOnboarded) {
        return fallback;
    }

    // If the component is not loading, user is authenticated, and not onboarded, show the children (onboarding form)
    return children;
}

// Loading skeleton that mirrors the onboarding form shell
export function OnboardingLoading() {
    return (
        <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
            <div className="w-full max-w-xl">
                <header className="mb-6 flex flex-col items-center gap-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-8 w-72 max-w-full sm:h-9" />
                </header>

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
