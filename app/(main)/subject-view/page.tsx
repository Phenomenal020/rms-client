'use client';

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import SubjectsComponent from "./SubjectsComponent";
import { getActiveTerm } from "@/fetcher/queries";
import { ACTIVE_TERM_KEY } from "@/fetcher/keys";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { authClient } from "@/src/auth-client";
import { ResultsSkeleton } from "../students-view/ResultsSkeleton";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";

const SubjectsPage = () => {
  // Routing and manual mutation for retries
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  // Retrieve the active academic term id
  const { data: academicTerm, error: academicTermError, isLoading: isAcademicTermLoading, statusCode: academicTermStatusCode } = getActiveTerm();
  const activeTermId = academicTerm?.id ?? null;
  // Retrieve the active school
  const { data: school, error: schoolError, isPending: isSchoolPending } = authClient.useActiveOrganization() ?? { data: null, error: null, isPending: false };

  // Aggregate loading and error states
  const shellLoadError = academicTermError ?? schoolError ?? null;
  const isShellLoading = isAcademicTermLoading || isSchoolPending;

  // Retry the shell fetches (active term only)
  function retryShellFetches() {
    void mutate(ACTIVE_TERM_KEY);
  }

  // Handle 401 or 403 errors by redirecting to sign-in or forbidden page
  useEffect(() => {
    if (!shellLoadError) return;
    const status = getHttpStatus(shellLoadError);
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [shellLoadError, router, pathname]);

  // Show loading skeleton while fetching data
  if (isShellLoading) {
    return <ResultsSkeleton title="Subject Sheet" />;
  }

  // Show error banner if there is an error
  if (shellLoadError !== null) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="Could not load subject sheet"
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

  // Show empty state if no active term is found
  if (!activeTermId || !academicTerm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <EmptyNoEntry
            embedded
            title="No active term"
            description="Create or activate an academic term before viewing subject sheets."
            actionLabel="Set up term"
            actionHref="/term"
          />
        </div>
      </div>
    );
  }

  // Show empty state if no school is found
  if (!school) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <EmptyNoEntry
            embedded
            title="No school selected"
            description="Select or set up your school before viewing subject sheets."
            actionLabel="Set up school"
            actionHref="/school"
          />
        </div>
      </div>
    );
  }

  return <SubjectsComponent school={school} activeTermId={activeTermId} activeTerm={academicTerm} />;
};

export default SubjectsPage;