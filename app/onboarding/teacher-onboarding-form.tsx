"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Form } from "@/shadcn/ui/form";
import { Card, CardContent } from "@/shadcn/ui/card";
import { getErrorMessage, useCreateTeacherJoinRequest } from "@/fetcher/mutations";
import type { UserData } from "@/types/drizzle";
import { displayValue, getBetterAuthHttpStatus, onboardingSchemaTeacher, type OnboardingFormValuesTeacher } from "./helpers";
import { OnboardingCompleteState, OnboardingNav, OnboardingRejectedState, OnboardingShell, OnboardingTextField, StepHeading, SummaryPanel, type OnboardingStep } from "./onboarding-shell";

//Teacher steps: Registration ID and Review
const TEACHER_STEPS = [
  { id: 1, title: "Registration ID", icon: KeyRound },
  { id: 2, title: "Review", icon: CheckCircle2 },
] as const satisfies readonly OnboardingStep[];
type TeacherStepKey = "registration" | "review" | "complete" | "rejected";

// Map any step to the corresponding index
function stepKeyToIndex(step: TeacherStepKey): number {
  switch (step) {
    case "registration":
      return 1;
    case "review":
      return 2;
    default:
      return 1;
  }
}

// Reverse process: Map index to step
function indexToStepKey(index: number): TeacherStepKey {
  return index === 2 ? "review" : "registration";
}

// Determine the initial step based on the user's onboarding status
function initialStep(status: UserData["onboardingStatus"]): TeacherStepKey {
  // default to "registration"
  if (status === "REJECTED") return "rejected";
  if (status === "PENDING") return "complete";
  return "registration";
}

type TeacherOnboardingFormProps = {
  user: UserData;
};

export function TeacherOnboardingForm({ user }: TeacherOnboardingFormProps) {
  // Router for redirection 
  const router = useRouter();
  // Pathname for redirection
  const pathname = usePathname();
  // Mutation hooks to create teacher join requests
  const { createTeacherJoinRequest, isMutating } = useCreateTeacherJoinRequest();

  // State management and input focus
  const [step, setStep] = useState<TeacherStepKey>(() => initialStep(user.onboardingStatus));
  const paneRef = useRef<HTMLDivElement>(null);

  // Onboarding form for the teacher
  const form = useForm<OnboardingFormValuesTeacher>({
    resolver: zodResolver(onboardingSchemaTeacher),
    defaultValues: {
      schoolRegistrationId: "",
    },
  });

  // Watch the form values
  const formValues = form.watch();

  // Mini-gate based on user's onboarding status
  useEffect(() => {
    switch (user.onboardingStatus) {
      case "APPROVED":
        router.replace("/dashboard");
        break;
      case "PENDING":
        setStep("complete");
        break;
      case "REJECTED":
        setStep("rejected");
        break;
      default:
        break;
    }
  }, [user.onboardingStatus, router]);

  // Autofocus input iff step is not complete or rejected
  useEffect(() => {
    if (step === "complete" || step === "rejected") return;
    const focusTarget = paneRef.current?.querySelector<HTMLElement>("input");
    focusTarget?.focus({ preventScroll: true });
  }, [step]);

  // Handle authentication redirects based on HTTP status. If 401/403, redirect. Otherwise, remain on page.
  function handleAuthRedirect(err: unknown): boolean {
    const status = getBetterAuthHttpStatus(err);
    if (status === 401) {
      toast.error("You are not authenticated. Please sign in to continue");
      router.replace(`/sign-in?redirect=${pathname}`);
      return true;
    }
    if (status === 403) {
      toast.error(
        "You are not authorized to access this page. Please contact your admin if you believe this is an error.",
      );
      router.replace("/forbidden");
      return true;
    }
    return false;
  }

  // on click back button
  function handleBack() {
    if (step === "review") setStep("registration");
  }

  // on click step button
  function handleStepClick(stepId: number) {
    setStep(indexToStepKey(stepId));
  }

  // on click try again button
  function handleTryAgain() {
    form.reset();
    setStep("registration");
  }

  // on click next button
  async function handleNext() {
    if (step === "registration") {
      // first validate the form
      const isValid = await form.trigger(["schoolRegistrationId"]);
      if (isValid) setStep("review");
      return;
    }

    if (step === "review") {
      await handleSubmit();
    }
  }

  // on click submit button
  async function handleSubmit() {
    const isValid = await form.trigger();
    if (!isValid) return;

    try {
      await createTeacherJoinRequest(form.getValues());
      setStep("complete");
      toast.success("Request submitted", {
        description: "Your join request has been sent to the school admin.",
      });
    } catch (err: unknown) {
      if (!handleAuthRedirect(err)) {
        toast.error("Failed to save teacher information", {
          description: getErrorMessage(
            err,
            "An error occurred while saving the teacher information",
          ),
        });
      }
    }
  }

  // on key down event, if Enter is pressed, handle next
  function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void handleNext();
  }

  // Review rows for the summary panel
  const reviewRows = [
    ["School registration ID", displayValue(formValues.schoolRegistrationId)],
  ] as const;

  // Show the complete state if the step is complete
  if (step === "complete") {
    return (
      <Card className="mx-auto w-full max-w-2xl border shadow-md">
        <CardContent className="pt-6">
          <OnboardingCompleteState
            title="Request submitted"
            description="Your join request has been sent to the school admin. They will review it and get back to you shortly."
          />
        </CardContent>
      </Card>
    );
  }

  // Show the rejected state if the step is rejected
  if (step === "rejected") {
    return (
      <Card className="mx-auto w-full max-w-2xl border shadow-md">
        <CardContent className="pt-6">
          <OnboardingRejectedState
            rejectionReason={user.rejectionReason ?? null}
            onTryAgain={handleTryAgain}
          />
        </CardContent>
      </Card>
    );
  }
  const currentStepIndex = stepKeyToIndex(step);

  // Render the onboarding shell
  return (
    <OnboardingShell
      steps={TEACHER_STEPS}
      currentStep={currentStepIndex}
      onStepClick={handleStepClick}
      footer={
        <OnboardingNav
          isFirstStep={step === "registration"}
          isSubmitStep={step === "review"}
          loading={isMutating}
          onBack={handleBack}
          onNext={() => void handleNext()}
          submitLabel="Submit request"
        />
      }
    >
      <Form {...form}>
        <form onKeyDown={handleFormKeyDown} noValidate>
          <section
            ref={paneRef}
            className="animate-in fade-in-0 slide-in-from-right-2 space-y-5 duration-300"
          >
            {step === "registration" && (
              <>
                <StepHeading
                  title="Join your school"
                  description="Enter the registration ID provided by your school admin."
                />
                <OnboardingTextField
                  control={form.control}
                  name="schoolRegistrationId"
                  id="schoolRegistrationId"
                  label="School registration ID"
                  autoComplete="organization"
                  placeholder="Enter school registration ID"
                />
              </>
            )}

            {step === "review" && (
              <>
                <StepHeading
                  title="Review your details"
                  description="Confirm everything looks correct before submitting. Use Back to make changes."
                />
                <SummaryPanel rows={reviewRows} />
              </>
            )}
          </section>
        </form>
      </Form>
    </OnboardingShell>
  );
}