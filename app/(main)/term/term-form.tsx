"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { getHttpStatus } from "@/fetcher/mutations";
import { getTerms } from "@/fetcher/queries";
import type { singleTermPayload } from "@/types/term";
import { TermSetupCard } from "./term/term-setup-card";
import { AssessmentStructureCard } from "./assessment-structure/assessment-structure-card";
import { GradingSystemCard } from "./gradingSystem/grading-system-card";
import { useUser } from "@/contexts/user-context";

export function TermForm() {
    // hooks for redirection
    const router = useRouter();
    const pathname = usePathname();
    // manually invalidate the cache
    const { mutate } = useSWRConfig();

    // Org admin gate — disable management features for non-orgadmin users
    const { user } = useUser();
    const canManage = user?.role === "orgadmin" && !(user?.twoFactorEnabled === true) && user?.emailVerified === true;

    // Fetch the user's terms from the db and extract the active term. Other components use this active term id to fetch the grading system and assessment structure for that term.
    const { data: terms, error: termsError, isLoading: isLoadingTerms } = getTerms();
    const termList = (terms ?? []) as singleTermPayload[];
    const activeTerm = termList.find((term) => term.status === "ACTIVE") ?? null;
    const activeTermId = activeTerm?.id ?? "";

    // On hit retry, invalidate the cache for the terms, grading system, and assessment structure
    function retryAllFetches() {
        void mutate("/api/v1/terms");
        void mutate((key) => typeof key === "string" && key.startsWith("/api/v1/grading-system"));
        void mutate((key) => typeof key === "string" && key.startsWith("/api/v1/assessment-structure"));
    }

    // handle authentication redirects based on the error status code
    useEffect(() => {
        if (!termsError) return;
        const status = getHttpStatus(termsError);
        if (status === 401) {
            router.replace(`/sign-in?redirect=${pathname}`);
        } else if (status === 403) {
            router.replace("/forbidden");
        }
    }, [termsError, router, pathname]);

    return (
        <>
            <TermSetupCard
                terms={termList}
                activeTerm={activeTerm}
                canManage={canManage}
                termsError={termsError}
                isLoadingTerms={isLoadingTerms}
                onRetry={retryAllFetches}
            />

            <AssessmentStructureCard
                termId={activeTermId}
                canManage={canManage}
                onRetryAll={retryAllFetches}
            />

            <GradingSystemCard
                termId={activeTermId}
                canManage={canManage}
                onRetryAll={retryAllFetches}
            />
        </>
    );
}