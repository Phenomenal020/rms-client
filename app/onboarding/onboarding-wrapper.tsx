"use client";

import { getUserWithRelations } from "@/fetcher/queries";
import { Card, CardContent } from "@/shadcn/ui/card";
import { AdminOnboardingForm } from "./admin-onboarding-form";
import { TeacherOnboardingForm } from "./teacher-onboarding-form";
import { OnboardingFormSkeleton } from "./helpers"

// Onboarding Wrapper
export function OnboardingForm() {
  // Get the user
  const { user, isLoading } = getUserWithRelations();

  // If it is still loading but there is no user yet, return the onboarding skeleton
  if (isLoading || !user) {
    return <OnboardingFormSkeleton />;
  }

  // Now, if the user is a school admin, show them the admin onboarding form
  if (user?.signUpRole === "SCHOOL_ADMIN") {
    return <AdminOnboardingForm user={user} />;
  }

  // Now, if the user is a regular teacher, show them the teacher onboarding form
  if (user?.signUpRole === "TEACHER") {
    return <TeacherOnboardingForm user={user} />;
  }

  // Else, return a generic message informing the user that something is wrong
  return (
    <Card className="mx-auto w-full max-w-2xl border shadow-md">
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        Your account role is not eligible for this onboarding flow. Please contact support.
      </CardContent>
    </Card>
  );
}