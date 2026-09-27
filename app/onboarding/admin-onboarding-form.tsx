"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Building2, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Form } from "@/shadcn/ui/form";
import { Card, CardContent } from "@/shadcn/ui/card";
import { getErrorMessage, useCreateOnboardingRequest } from "@/fetcher/mutations";
import type { UserData } from "@/types/drizzle";
import { displayValue, getBetterAuthHttpStatus, onboardingSchemaAdmin, type OnboardingFormValuesAdmin } from "./helpers";
import { OnboardingCompleteState, OnboardingNav, OnboardingRejectedState, OnboardingShell, OnboardingTextField, StepHeading, SummaryPanel, type OnboardingStep } from "./onboarding-shell";

//Admin steps: Organisation, Contact, and Review
const ADMIN_STEPS = [
  { id: 1, title: "Organisation", icon: Building2 },
  { id: 2, title: "Contact", icon: Mail },
  { id: 3, title: "Review", icon: CheckCircle2 },
] as const satisfies readonly OnboardingStep[];

// Extended to include complete and rejected steps
type AdminStepKey = "organisation" | "contact" | "review" | "complete" | "rejected";

// Map any step to the corresponding index
function stepKeyToIndex(step: AdminStepKey): number {
  switch (step) {
    case "organisation":
      return 1;
    case "contact":
      return 2;
    case "review":
      return 3;
    default:
      return 1;
  }
}
// Reverse process: Map index to step
function indexToStepKey(index: number): AdminStepKey {
  switch (index) {
    case 1:
      return "organisation";
    case 2:
      return "contact";
    case 3:
      return "review";
    default:
      return "organisation";
  }
}

// Determine the initial step based on the user's onboarding status
function initialStep(status: UserData["onboardingStatus"]): AdminStepKey {
  if (status === "REJECTED") return "rejected";
  if (status === "PENDING") return "complete";
  // default to "organisation"
  return "organisation";
}

type AdminOnboardingFormProps = {
  user: UserData;
};

export function AdminOnboardingForm({ user }: AdminOnboardingFormProps) {
  // Router for redirection 
  const router = useRouter();
  const pathname = usePathname();
  // Mutation hooks to create onboarding requests
  const { createOnboardingRequest, isMutating } = useCreateOnboardingRequest();

  // State management and input focus
  const [step, setStep] = useState<AdminStepKey>(() => initialStep(user.onboardingStatus));
  const paneRef = useRef<HTMLDivElement>(null);

  // Onboarding form for the admin
  const form = useForm<OnboardingFormValuesAdmin>({
    resolver: zodResolver(onboardingSchemaAdmin),
    defaultValues: {
      organisationName: "",
      organisationAddressLine1: "",
      organisationCity: "",
      organisationState: "",
      organisationPostalCode: "",
      organisationCountry: "",
      contactEmail: "",
      contactPhone: "",
    },
  });
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
    if (step === "contact") setStep("organisation");
    else if (step === "review") setStep("contact");
  }

  // on click step button
  function handleStepClick(stepId: number) {
    setStep(indexToStepKey(stepId));
  }

  // on click try again button
  function handleTryAgain() {
    form.reset();
    setStep("organisation");
  }

  // on click next button
  async function handleNext() {
    if (step === "organisation") {
      // first validate the form
      const isValid = await form.trigger([
        "organisationName",
        "organisationAddressLine1",
        "organisationCity",
        "organisationState",
        "organisationPostalCode",
        "organisationCountry",
      ]);
      if (isValid) setStep("contact");
      return;
    }

    if (step === "contact") {
      const isValid = await form.trigger(["contactEmail", "contactPhone"]);
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
      await createOnboardingRequest(form.getValues());
      setStep("complete");
      toast.success("Registration submitted", {
        description: "Your organisation registration is now under review.",
      });
    } catch (err: unknown) {
      if (!handleAuthRedirect(err)) {
        toast.error("Failed to save organisation information", {
          description: getErrorMessage(
            err,
            "An error occurred while saving the organisation information",
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
    ["Organisation name", displayValue(formValues.organisationName)],
    ["Address", displayValue(formValues.organisationAddressLine1)],
    ["City", displayValue(formValues.organisationCity)],
    ["State / province", displayValue(formValues.organisationState)],
    ["Postal code", displayValue(formValues.organisationPostalCode)],
    ["Country", displayValue(formValues.organisationCountry)],
    ["Contact email", displayValue(formValues.contactEmail)],
    ["Contact phone", displayValue(formValues.contactPhone)],
  ] as const;

  // Show the complete state if the step is complete
  if (step === "complete") {
    return (
      <Card className="mx-auto w-full max-w-2xl border shadow-md">
        <CardContent className="pt-6">
          <OnboardingCompleteState
            title="Registration submitted"
            description="Your registration is in review. An admin will verify the details shortly, then you can start using the platform."
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

  return (
    <OnboardingShell
      steps={ADMIN_STEPS}
      currentStep={currentStepIndex}
      onStepClick={handleStepClick}
      footer={
        <OnboardingNav
          isFirstStep={step === "organisation"}
          isSubmitStep={step === "review"}
          loading={isMutating}
          onBack={handleBack}
          onNext={() => void handleNext()}
        />
      }
    >
      <Form {...form}>
        <form onKeyDown={handleFormKeyDown} noValidate>
          <section
            ref={paneRef}
            className="animate-in fade-in-0 slide-in-from-right-2 space-y-6 duration-300"
          >
            {step === "organisation" && (
              <>
                <StepHeading
                  title="Organisation information"
                  description="Enter your organisation's official name and address."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <OnboardingTextField
                    control={form.control}
                    name="organisationName"
                    id="organisationName"
                    label="Organisation name"
                    autoComplete="organization"
                    placeholder="Enter organisation name"
                  />
                  <OnboardingTextField
                    control={form.control}
                    name="organisationCountry"
                    id="organisationCountry"
                    label="Country"
                    autoComplete="country-name"
                    placeholder="Enter country"
                  />
                </div>
                <OnboardingTextField
                  control={form.control}
                  name="organisationAddressLine1"
                  id="organisationAddressLine1"
                  label="Address line 1"
                  autoComplete="address-line1"
                  placeholder="Enter street address"
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <OnboardingTextField
                    control={form.control}
                    name="organisationCity"
                    id="organisationCity"
                    label="City"
                    autoComplete="address-level2"
                    placeholder="Enter city"
                  />
                  <OnboardingTextField
                    control={form.control}
                    name="organisationState"
                    id="organisationState"
                    label="State / province"
                    autoComplete="address-level1"
                    placeholder="Enter state or province"
                  />
                  <OnboardingTextField
                    control={form.control}
                    name="organisationPostalCode"
                    id="organisationPostalCode"
                    label="Postal code"
                    autoComplete="postal-code"
                    placeholder="Enter postal code"
                  />
                </div>
              </>
            )}

            {step === "contact" && (
              <>
                <StepHeading
                  title="Contact information"
                  description="Provide the admin contact details for this onboarding request."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <OnboardingTextField
                    control={form.control}
                    name="contactEmail"
                    id="contactEmail"
                    label="Contact email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter contact email"
                  />
                  <OnboardingTextField
                    control={form.control}
                    name="contactPhone"
                    id="contactPhone"
                    label="Contact phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter contact phone number"
                  />
                </div>
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