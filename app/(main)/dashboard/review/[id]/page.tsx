"use client";

import ResultsComponent from "@/app/(main)/students-view/ResultsComponent";
import { ResultsSkeleton } from "@/app/(main)/students-view/ResultsSkeleton";
import { getTerms } from "@/fetcher/queries";
import { authClient } from "@/src/auth-client";
import type { AcademicTerm } from "@/types/drizzle";
import {useParams} from "next/navigation";

export default function ReviewPage() {

    // to route back to dashboard upon successful review
    const { id } = useParams();

    // grab the request id from the params
    const requestId = id || null;

    // if the request id is not valid, return an error
    if (!requestId) {
        return (
            <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                <p className="text-muted-foreground text-center max-w-md">
                    Invalid request.
                </p>
            </div>
        );
    }

    // get the active organisation (school) using BA's active organization hook
    const { data: school } = authClient.useActiveOrganization() ?? null;

    // Get the active academic term: Fetch the terms, then select the one with status set to ACTIVE
    const { data: terms = [], error: termsError, isLoading: isTermsLoading } = getTerms();
    const academicTerm: AcademicTerm | null = terms.find((term: AcademicTerm) => term?.status === "ACTIVE") ?? null;


    // if there is an error, return an error
    if (termsError) {
        return (
            <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                <p className="text-destructive text-center max-w-md">
                    {termsError.message || "Could not load the active academic term."}
                </p>
            </div>
        );
    }

    // if the academic term is not loaded, return a skeleton
    if (isTermsLoading) {
        return <ResultsSkeleton />;
    }

    // if the school is not loaded, return an error
    if (!school) {
        return (
            <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                <p className="text-muted-foreground text-center max-w-md">
                    No active school. Select a school and try again.
                </p>
            </div>
        );
    }

    return (
        <ResultsComponent
            school={school}
            academicTerm={academicTerm}
            mode="review"
            requestId={requestId as string}
        />
    );
}