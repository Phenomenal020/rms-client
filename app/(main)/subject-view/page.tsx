'use client';

import type { AcademicTerm } from "@/types/drizzle";
import SubjectsComponent from "./SubjectsComponent";
import { getTerms, getUserWithRelations } from "@/fetcher/queries";
import { authClient } from "@/src/auth-client";
import { ResultsSkeleton } from "../students-view/ResultsSkeleton";

const SubjectsPage = () => {
  const { error: userError, isLoading: isUserLoading } = getUserWithRelations();

  // Get the active academic term: fetch terms, then select the one with status ACTIVE
  const { data: terms = [], error: termsError, isLoading: isTermsLoading } = getTerms();
  const academicTerm: AcademicTerm | null =
    terms.find((term: AcademicTerm) => term?.status === "ACTIVE") ?? null;

  // Active organisation as school (TODO: set active organisation on session creation as db hook)
  const { data: school } = authClient.useActiveOrganization() ?? null;

  const error = userError || termsError;
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  if (isUserLoading || isTermsLoading) {
    return <ResultsSkeleton />;
  }

  // TODO: custom empty state with back/refresh
  if (!academicTerm) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">No academic term available.</p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">No school record available.</p>
      </div>
    );
  }

  return <SubjectsComponent school={school} academicTerm={academicTerm} />;
};

export default SubjectsPage;
