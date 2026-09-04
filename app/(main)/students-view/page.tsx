'use client';

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import type { AcademicTerm } from "@/types/drizzle";
import ResultsComponent from "./ResultsComponent";
import { getTerms } from "@/fetcher/queries";
import { TERMS_KEY } from "@/fetcher/keys";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { authClient } from "@/src/auth-client";
import { ResultsSkeleton } from "./ResultsSkeleton";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";

const ResultsPage = () => {
  // Router hooks
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  // Data hooks: terms, school
  const { data: terms, error: termsError, isLoading: isTermsLoading } = getTerms();
  const academicTerm: AcademicTerm | null = terms?.find((term: AcademicTerm) => term?.status === "ACTIVE") ?? null;
  const { data: school, error: schoolError, isPending: isSchoolPending } =
    authClient.useActiveOrganization() ?? { data: null, error: null, isPending: false };

  // Aggregate loading states and errors
  const shellLoadError = termsError ?? schoolError ?? null;
  const isShellLoading = isTermsLoading || isSchoolPending;

  // Retry shell fetches - retry the shell fetches if the shell load error is present
  function retryShellFetches() {
    void mutate("/api/v1/terms");
  }

  // Handle auth redirect if error status is 401 or 403
  useEffect(() => {
    if (!shellLoadError) return;
    const status = getHttpStatus(shellLoadError);
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [shellLoadError, router, pathname]);

  // Handle loading states
  if (isShellLoading) {
    return <ResultsSkeleton title="Result Sheet" />;
  }

  // Handle shell load error
  if (shellLoadError !== null) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="Could not load result sheet"
            message={getApiErrorMessage(
              shellLoadError,
              "Failed to load your session, school, or academic term. Please try again.",
            )}
            onRetry={retryShellFetches}
          />
        </div>
      </div>
    );
  }

  // Handle no active academic term (successful fetch, no ACTIVE term)
  if (!academicTerm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <EmptyNoEntry
            embedded
            title="No active term"
            description="Create or activate an academic term before viewing result sheets."
            actionLabel="Set up term"
            actionHref="/term"
          />
        </div>
      </div>
    );
  }

  // Handle no school selected state
  if (!school) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <EmptyNoEntry
            embedded
            title="No school selected"
            description="Select or set up your school before viewing result sheets."
            actionLabel="Set up school"
            actionHref="/school"
          />
        </div>
      </div>
    );
  }

  return (
    <ResultsComponent
      school={school}
      academicTerm={academicTerm}
      mode="view"
      requestId={null}
    />
  );
};

export default ResultsPage;