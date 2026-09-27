"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import StudentsComponent from "./StudentsComponent";
import { getActiveTerm } from "@/fetcher/queries";
import { ACTIVE_TERM_KEY } from "@/fetcher/keys";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { authClient } from "@/src/auth-client";
import { ResultsSkeleton } from "./ResultsSkeleton";
import { ErrorBanner } from "@/shared-components/error-banner";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";

const ResultsPage = () => {
  // for manual retries and redirection
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  // get the active term
  const { data: academicTerm, error: academicTermError, isLoading: isAcademicTermLoading } = getActiveTerm();
  const activeTermId = academicTerm?.id ?? null;

  // get the active school
  const { data: school = null, error: schoolError = null, isPending: isSchoolPending = false } = authClient.useActiveOrganization()

  // combine the errors and loading states
  const shellLoadError = academicTermError ?? schoolError ?? null;
  const isShellLoading = isAcademicTermLoading || isSchoolPending;

  // retry the shell fetches
  function retryShellFetches() {
    void mutate(ACTIVE_TERM_KEY);
    // void mutate(ORG_KEY);
  }

  // redirect if the shell is not loading and there is an error
  useEffect(() => {
    if (!shellLoadError) return;
    const status = getHttpStatus(shellLoadError);
    if (status === 401) {
      router.replace(`/sign-in?redirect=${pathname}`);
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [shellLoadError, router, pathname]);

  // show the skeleton if the shell is loading
  if (isShellLoading) {
    return <ResultsSkeleton title="Result Sheet" />;
  }

  // show the error banner if the shell is not loading and there is an error
  if (shellLoadError !== null) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="Could not load result sheet"
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

  // show the empty no entry if the active term is not found
  if (!activeTermId || !academicTerm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <EmptyNoEntry
            embedded
            title="No active term"
            description="An active academic term is required to view result sheets."
            actionLabel="Set up term"
            actionHref="/term"
          />
        </div>
      </div>
    );
  }

  // show the empty no entry if the school is not found
  if (!school) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <EmptyNoEntry
            embedded
            title="No school selected"
            description="An active school is required to view result sheets."
            actionLabel="Set up school"
            actionHref="/school"
          />
        </div>
      </div>
    );
  }

  // show the students component if the shell is not loading and there is no error
  return (
    <StudentsComponent
      school={school}
      activeTermId={activeTermId}
      activeTerm={academicTerm}
    />
  );
};

// export the results page
export default ResultsPage;