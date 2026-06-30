"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import ResultsComponent from "@/app/(main)/students-view/ResultsComponent";
import { ResultsSkeleton } from "@/app/(main)/students-view/ResultsSkeleton";
import { ErrorBanner } from "@/shared-components/error-banner";
import { getTerms } from "@/fetcher/queries";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { authClient } from "@/src/auth-client";
import type { AcademicTerm } from "@/types/drizzle";

export function ReviewPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();
  const { id } = useParams();

  const requestId = typeof id === "string" ? id : null;

  const { data: school, error: schoolError, isPending: isSchoolPending } =
    authClient.useActiveOrganization() ?? { data: null, error: null, isPending: false };

  const { data: terms, error: termsError, isLoading: isTermsLoading } = getTerms();
  const academicTerm: AcademicTerm | null =
    terms?.find((term: AcademicTerm) => term?.status === "ACTIVE") ?? null;

  const shellLoadError = termsError ?? schoolError ?? null;
  const isShellLoading = isTermsLoading || isSchoolPending;

  function retryShellFetches() {
    void mutate("/api/v1/terms");
  }

  useEffect(() => {
    if (!shellLoadError) return;
    const status = getHttpStatus(shellLoadError);
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [shellLoadError, router, pathname]);

  if (!requestId) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground text-center max-w-md">Invalid request.</p>
      </div>
    );
  }

  if (isShellLoading) {
    return <ResultsSkeleton />;
  }

  if (shellLoadError) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="Could not load review"
            message={getApiErrorMessage(
              shellLoadError,
              "Failed to load school or academic term. Please try again.",
            )}
            onRetry={retryShellFetches}
          />
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="No school selected"
            message="No active school. Select a school and try again."
            onRetry={retryShellFetches}
          />
        </div>
      </div>
    );
  }

  if (!academicTerm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="No active term"
            message="No academic term found. Please create or activate an academic term first."
            onRetry={retryShellFetches}
          />
        </div>
      </div>
    );
  }

  return (
    <ResultsComponent
      school={school}
      academicTerm={academicTerm}
      mode="review"
      requestId={requestId}
    />
  );
}
