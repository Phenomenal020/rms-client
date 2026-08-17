'use client';

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import type { AcademicTerm } from "@/types/drizzle";
import SubjectsComponent from "./SubjectsComponent";
import { getTerms } from "@/fetcher/queries";
import { getApiErrorMessage, getHttpStatus } from "@/fetcher/mutations";
import { authClient } from "@/src/auth-client";
import { ResultsSkeleton } from "../students-view/ResultsSkeleton";
import { ErrorBanner } from "@/shared-components/error-banner";

const SubjectsPage = () => {
  // Routing and manual mutation for retries
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  // Retrieve the active academic term
  const { data: terms, error: termsError, isLoading: isTermsLoading } = getTerms();
  const academicTerm: AcademicTerm | null = terms?.find((term: AcademicTerm) => term?.status === "ACTIVE") ?? null;
  // Retrieve the active school
  const { data: school, error: schoolError, isPending: isSchoolPending } = authClient.useActiveOrganization() ?? { data: null, error: null, isPending: false };

  // Aggregate loading and error states
  const shellLoadError = termsError ?? schoolError ?? null;
  const isShellLoading = isTermsLoading || isSchoolPending;

  // Retry the shell fetches (terms only)
  function retryShellFetches() {
    void mutate("/api/v1/terms");
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

  // Show error banner if no academic term is found
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

  // Show error banner if no school is found
  if (!school) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner
            title="No school selected"
            message="No school record found. Select or set up your school and try again."
            onRetry={retryShellFetches}
          />
        </div>
      </div>
    );
  }

  return <SubjectsComponent school={school} academicTerm={academicTerm} />;
};

export default SubjectsPage;