'use client';

import { AcademicTerm } from "@/types/drizzle";
import ResultsComponent from "./ResultsComponent";
import { getTerms } from "@/fetcher/queries";
import { getUserWithRelations } from "@/fetcher/queries";
import { authClient } from "@/src/auth-client";
import { ResultsSkeleton } from "./ResultsSkeleton";

const ResultsPage = () => {

  const { error: userError, isLoading: isUserLoading } = getUserWithRelations();

  // Get the active academic term: Fetch the terms, then select the one with status set to ACTIVE
  const { data: terms = [], error: termsError, isLoading: isTermsLoading } = getTerms();
  const academicTerm: AcademicTerm | null = terms.find((term: AcademicTerm) => term?.status === "ACTIVE") ?? null;

  // Get the active organisation as the school (TODO: Set active organisation on session creation as db hook)
  const { data: school } = authClient.useActiveOrganization() ?? null;

  // Handle error state: TODO: throw error so error component handles it
  const error = userError || termsError;
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  // Handle loading state if term or user is loading
  if (isUserLoading || isTermsLoading) {
    return <ResultsSkeleton />;
  }

  // Handle no academic term state: TODO: Create a custom empty array component for this. Should have back/refresh button
  if (!academicTerm) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">No academic term available.</p>
      </div>
    );
  }

  // Do same for school
  if (!school) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">No school record available.</p>
      </div>
    );
  }

  // Finally, pass the school and academic term data to the ResultsComponent
  return <ResultsComponent school={school} academicTerm={academicTerm} mode="view" requestId={null} />;
};

export default ResultsPage