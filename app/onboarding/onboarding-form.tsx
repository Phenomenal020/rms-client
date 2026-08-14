"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Hourglass } from "lucide-react";
import { LoadingButton } from "@/shared-components/loading-button";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { getErrorMessage, useCreateOnboardingRequest, useCreateTeacherJoinRequest } from "@/fetcher/mutations";
import { useUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";
import { Input } from "@/shadcn/ui/input";

// progress steps for the admin onboarding process
const ADMIN_PROGRESS_STEPS = [
  "admin-organisation",
  "admin-contact",
  "admin-review",
] as const;
const ADMIN_PROGRESS_LABELS = ["Organisation", "Contact", "Review"] as const;

// progress steps for the teacher onboarding process
const TEACHER_PROGRESS_STEPS = ["teacher-regId", "teacher-review"] as const;
const TEACHER_PROGRESS_LABELS = ["Registration ID", "Review"] as const;

// schema for the admin onboarding form
const onboardingSchemaAdmin = z.object({
  organisationName: z
    .string()
    .trim()
    .min(1, { message: "Organisation name is required" })
    .max(128, { message: "Organisation name must not be more than 128 characters" }),
  organisationAddressLine1: z
    .string()
    .trim()
    .min(1, { message: "Address is required" })
    .max(128, { message: "Address must not be more than 128 characters" }),
  organisationCity: z
    .string()
    .trim()
    .min(1, { message: "City is required" })
    .max(128, { message: "City must not be more than 128 characters" }),
  organisationState: z
    .string()
    .trim()
    .min(1, { message: "State / province is required" })
    .max(128, { message: "State / province must not be more than 128 characters" }),
  organisationPostalCode: z
    .string()
    .trim()
    .min(1, { message: "Postal code is required" })
    .max(16, { message: "Postal code must not be more than 16 characters" }),
  organisationCountry: z
    .string()
    .trim()
    .min(1, { message: "Country is required" })
    .max(128, { message: "Country must not be more than 128 characters" }),
  contactEmail: z
    .email({ message: "Invalid email address" })
    .min(1, { message: "Contact email is required" })
    .max(128, { message: "Contact email must not be more than 128 characters" }),
  contactPhone: z
    .string()
    .trim()
    .min(1, { message: "Contact phone is required" })
    // 11 digits, or "+" plus 11–12 digits (12–13 chars total with country code)
    .regex(/^(\d{11}|\+\d{11,12})$/, {
      message: "Enter 11 digits, or + followed by 11–12 digits including country code",
    })
    .max(16, { message: "Contact phone must not be more than 16 characters" }),
});
type OnboardingFormValuesAdmin = z.input<typeof onboardingSchemaAdmin>;

// schema for the teacher onboarding form
const onboardingSchemaTeacher = z.object({
  schoolRegistrationId: z
    .string()
    .trim()
    .min(1, {
      message: "Please enter a valid school registration ID or contact your school admin",
    }),
});
type OnboardingFormValuesTeacher = z.input<typeof onboardingSchemaTeacher>;

// helper function to get the HTTP status from the error object
function getBetterAuthHttpStatus(err: unknown): number | undefined {
  const status =
    (err as { status?: number })?.status ??
    (err as { response?: { status?: number } })?.response?.status;
  return typeof status === "number" ? status : undefined;
}

// helper function to display the value of a field (or a fallback)
function displayValue(value: string | null | undefined, fallback = "—") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

// props for the onboarding text field component
type OnboardingTextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  id: string;
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
};
// Onboarding text field component
function OnboardingTextField<T extends FieldValues>({
  control,
  name,
  id,
  label,
  placeholder,
  type = "text",
  autoComplete,
}: OnboardingTextFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="mb-5">
          <FormLabel htmlFor={id}>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              id={id}
              type={type}
              autoComplete={autoComplete}
              placeholder={placeholder}
              className="h-10 text-base"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// props for the onboarding navigation component
type OnboardingNavProps = {
  isFirstStep: boolean;
  isSubmitStep: boolean;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
  submitLabel?: string;
};
// Onboarding navigation component
function OnboardingNav({
  isFirstStep,
  isSubmitStep,
  loading,
  onBack,
  onNext,
  submitLabel = "Submit registration",
}: OnboardingNavProps) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep || loading}
        className={cn(isFirstStep && "invisible")}
      >
        Previous
      </Button>
      <LoadingButton type="button" loading={loading} onClick={onNext}>
        {isSubmitStep ? submitLabel : "Next"}
      </LoadingButton>
    </div>
  );
}

type ProgressStepsProps = {
  labels: readonly string[];
  currentIndex: number;
};

// The progress steps component (1 -> 2 -> 3 with dots/checks and lines)
function ProgressSteps({ labels, currentIndex }: ProgressStepsProps) {
  return (
    <div className="mb-6 flex items-start" aria-label="Registration progress">
      {labels.map((label, index) => {
        // determine if the step is active or done
        const isActive = index === currentIndex;
        const isDone = index < currentIndex;
        // return the corresponding component for the step
        return (
          <div key={label} className="relative flex flex-1 flex-col items-center gap-2">
            {/* draw the line between the steps */}
            {index < labels.length - 1 && (
              <div
                className={cn(
                  "absolute top-[18px] left-[calc(50%+22px)] right-[calc(-50%+22px)] h-0.5",
                  isDone ? "bg-primary" : "bg-border",
                )}
                aria-hidden
              />
            )}
            {/* draw the dot/check for the step */}
            <div
              className={cn(
                "relative z-10 flex size-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                isActive && "border-primary bg-primary text-primary-foreground",
                isDone && "border-primary bg-background text-primary",
                !isActive && !isDone && "border-border bg-background text-muted-foreground",
              )}
            >
              {isDone ? <Check className="size-4" /> : index + 1}
            </div>
            {/* draw the label for the step */}
            <span
              className={cn(
                "hidden text-center text-xs sm:block",
                isActive ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// The actual onboarding form component
export function OnboardingForm() {
  // get the router and pathname from the useRouter hook
  const router = useRouter();
  const pathname = usePathname();

  // get the user's signed up role from the useUser hook
  const { user, isLoading } = useUser();
  const userOnboardingStatus = user?.onboardingStatus;

  const signedUpRole = user?.signUpRole;
  const isSchoolAdmin = signedUpRole === "SCHOOL_ADMIN";
  const isTeacher = signedUpRole === "TEACHER";

  // mutation hook for creating an onboarding request (school admin flow)
  const { createOnboardingRequest, isMutating: isCreatingOnboarding } = useCreateOnboardingRequest();
  // mutation hook for creating a teacher join request (teacher flow)
  const { createTeacherJoinRequest, isMutating: isCreatingJoinRequest } = useCreateTeacherJoinRequest();

  // create the admin form from the admin schema.
  const adminForm = useForm<OnboardingFormValuesAdmin>({
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
  // create the teacher form from the teacher schema.
  const teacherForm = useForm<OnboardingFormValuesTeacher>({
    resolver: zodResolver(onboardingSchemaTeacher),
    defaultValues: {
      schoolRegistrationId: "",
    },
  });

  // set the initial step based on the user's signed up role. Cheap operations, should not cause any performance issues.
  const [step, setStep] = useState(() => {
    if (userOnboardingStatus === "REJECTED") {
      return "request-rejected";
    }
    if (userOnboardingStatus === "PENDING") {
      return isTeacher ? "teacher-complete" : "admin-complete";
    }
    return isTeacher ? "teacher-regId" : "admin-organisation";
  });
  // useEffect to set the step to the teacher-regId or admin-organisation if the user is a teacher or school admin respectively
  useEffect(() => {
    // check the user's onboarding status
    switch (userOnboardingStatus) {
      case "APPROVED":
        router.replace("/dashboard");
        break; // user is already onboarded, redirect to the dashboard
      case "PENDING":
        if (signedUpRole === "SCHOOL_ADMIN") {
          setStep("admin-complete");  // pending and admin, simply show the final step
        } else if (signedUpRole === "TEACHER") {
          setStep("teacher-complete");  // pending and teacher, simply show the final step
        }
        break;
      case "REJECTED":
        setStep("request-rejected");
        break;
      default:
        break;
    }
  }, [userOnboardingStatus, signedUpRole, router]);

  const adminStepIndex = (ADMIN_PROGRESS_STEPS as readonly string[]).indexOf(step);
  const teacherStepIndex = (TEACHER_PROGRESS_STEPS as readonly string[]).indexOf(step);
  const showAdminProgress = isSchoolAdmin && adminStepIndex >= 0;
  const showTeacherProgress = isTeacher && teacherStepIndex >= 0;
  const isAdminStep = isSchoolAdmin && adminStepIndex >= 0;
  const isTeacherStep = isTeacher && teacherStepIndex >= 0;
  const isAdminComplete = isSchoolAdmin && step === "admin-complete";
  const isTeacherComplete = isTeacher && step === "teacher-complete";
  const rejectionReason = user?.rejectionReason ?? null;
  const adminFormValues = adminForm.watch();
  const teacherFormValues = teacherForm.watch();

  // helper function to handle authentication redirects
  function handleAuthRedirect(err: unknown): boolean {
    // get the HTTP status from the error object
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

  // Back is straightforward
  // helper function to go back to the previous step
  function handleBack() {
    switch (step) {
      case "admin-contact":
        setStep("admin-organisation");
        break;
      case "admin-review":
        setStep("admin-contact");
        break;
      case "teacher-review":
        setStep("teacher-regId");
        break;
      default:
        break;
    }
  }

  // helper function to handle the try again button. Simply reset the form and leave db as is until a new request is submitted.
  function handleTryAgain() {
    adminForm.reset();
    teacherForm.reset();
    setStep(isTeacher ? "teacher-regId" : "admin-organisation");
  }

  // Next requires special handling for both processes
  // helper function to handle the next step for the admin onboarding process
  async function handleAdminNext() {
    // always check if the form is valid before moving to the next step
    let isValid = false;
    switch (step) {
      case "admin-organisation":
        isValid = await adminForm.trigger([
          "organisationName",
          "organisationAddressLine1",
          "organisationCity",
          "organisationState",
          "organisationPostalCode",
          "organisationCountry",
        ]);
        if (!isValid) return;
        // move to the next step
        setStep("admin-contact");
        break;
      case "admin-contact":
        isValid = await adminForm.trigger(["contactEmail", "contactPhone"]);
        if (!isValid) return;
        // move to the next step
        setStep("admin-review");
        break;
      case "admin-review":
        isValid = await adminForm.trigger();
        if (!isValid) return;
        // move to the next step
        setStep("admin-complete");
        // Enter on the review step should submit, not skip the API call
        // await handleAdminSubmit();
        break;
      default:
        return;
    }
  }
  // helper function to handle the next step for the teacher onboarding process
  async function handleTeacherNext() {
    // always check if the form is valid before moving to the next step
    let isValid = false;
    switch (step) {
      case "teacher-regId":
        isValid = await teacherForm.trigger(["schoolRegistrationId"]);
        if (!isValid) return;
        // move to the next step
        setStep("teacher-review");
        break;
      case "teacher-review":
        isValid = await teacherForm.trigger();
        if (!isValid) return;
        // move to the next step
        setStep("teacher-complete");
        // Enter on the review step should submit, not skip the API call
        // await handleTeacherSubmit();
        break;
      default:
        return;
    }
  }

  // handle the submission for the admin onboarding process
  async function handleAdminSubmit() {
    const isValid = await adminForm.trigger();  // this time, validate the entire admin form
    if (!isValid) return;
    // getValues matches createOnboardingRequestPayload field-for-field
    const formData = adminForm.getValues();
    try {
      await createOnboardingRequest(formData);
      // only advance to the complete step after a successful API response
      setStep("admin-complete");
    } catch (err: unknown) {
      console.log("error from createOnboardingRequest", err);
      if (!handleAuthRedirect(err)) { // redirect only on 401/403 errors
        toast.error("Failed to save organisation information", {
          description: getErrorMessage(
            err,
            "An error occurred while saving the organisation information",
          ),
        });  // Otherwise, simply toast the error
      }
    }
  }

  // handle the submission for the teacher onboarding process
  async function handleTeacherSubmit() {
    const isValid = await teacherForm.trigger();  // this time, validate the entire teacher form
    if (!isValid) return;
    // getValues matches createTeacherJoinRequestPayload field-for-field
    const formData = teacherForm.getValues();
    try {
      await createTeacherJoinRequest(formData);
      // only advance to the complete step after a successful API response
      setStep("teacher-complete");
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

  // enter key handler for the form
  function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (isAdminStep) void handleAdminNext();
    else if (isTeacherStep) void handleTeacherNext();
  }

  // Autofocus the first input field in the pane when the step changes
  // create a ref to the pane element 
  const paneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isAdminStep && !isTeacherStep) return;
    const focusTarget = paneRef.current?.querySelector<HTMLElement>("input");
    focusTarget?.focus({ preventScroll: true });
  }, [step, isAdminStep, isTeacherStep]);

  // review rows for the admin onboarding process (forms the title and review values)
  const adminReviewRows = [
    ["Organisation name", displayValue(adminFormValues.organisationName)],
    ["Address", displayValue(adminFormValues.organisationAddressLine1)],
    ["City", displayValue(adminFormValues.organisationCity)],
    ["State / province", displayValue(adminFormValues.organisationState)],
    ["Postal code", displayValue(adminFormValues.organisationPostalCode)],
    ["Country", displayValue(adminFormValues.organisationCountry)],
    ["Contact email", displayValue(adminFormValues.contactEmail)],
    ["Contact phone", displayValue(adminFormValues.contactPhone)],
  ] as const;
  // review rows for the teacher onboarding process 
  const teacherReviewRows = [
    ["School registration ID", displayValue(teacherFormValues.schoolRegistrationId)],
  ] as const;

  // The header for the onboarding form
  const header = (() => {
    switch (step) {
      case "teacher-regId":
      case "teacher-review":
        return { eyebrow: "Teacher onboarding", title: "Join a school" };
      case "teacher-complete":
      case "admin-complete":
        return { eyebrow: "Registration complete", title: "You're all set" };
      default:
        return { eyebrow: "New organisation registration", title: "Enroll your organisation" };
    }
  })();

  // Wait for user before rendering — must stay after all hooks above
  if (isLoading || !user) return null;

  return (
    <div className="w-full max-w-xl">
      {/* The header for the onboarding form */}
      <header className="mb-6 text-center">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {header.eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {header.title}
        </h1>
      </header>

      {/* The Progress steps */}
      {showAdminProgress && (
        <ProgressSteps labels={ADMIN_PROGRESS_LABELS} currentIndex={adminStepIndex} />
      )}
      {showTeacherProgress && (
        <ProgressSteps labels={TEACHER_PROGRESS_LABELS} currentIndex={teacherStepIndex} />
      )}

      <Card className="border shadow-md">
        <CardContent className="pt-6">
          {isAdminStep && (
            <Form {...adminForm}>
              <form onKeyDown={handleFormKeyDown} noValidate>
                <section ref={paneRef} className="animate-in fade-in-0 slide-in-from-right-2 duration-300">
                  {/* Organisation information */}
                  {step === "admin-organisation" && (
                    <>
                      <h2 className="text-xl font-semibold text-foreground">
                        Organisation information
                      </h2>
                      <p className="mt-1 mb-6 text-sm text-muted-foreground">
                        Enter your organisation&apos;s official name and address.
                      </p>
                      {/* Organisation name */}
                      <OnboardingTextField
                        control={adminForm.control}
                        name="organisationName"
                        id="organisationName"
                        label="Organisation name"
                        autoComplete="organization"
                        placeholder="Enter organisation name"
                      />
                      {/* Address line 1 */}
                      <OnboardingTextField
                        control={adminForm.control}
                        name="organisationAddressLine1"
                        id="organisationAddressLine1"
                        label="Address line 1"
                        autoComplete="address-line1"
                        placeholder="Enter street address"
                      />
                      {/* City */}
                      <OnboardingTextField
                        control={adminForm.control}
                        name="organisationCity"
                        id="organisationCity"
                        label="City"
                        autoComplete="address-level2"
                        placeholder="Enter city"
                      />
                      {/* State / province */}
                      <OnboardingTextField
                        control={adminForm.control}
                        name="organisationState"
                        id="organisationState"
                        label="State / province"
                        autoComplete="address-level1"
                        placeholder="Enter state or province"
                      />
                      {/* Postal code */}
                      <OnboardingTextField
                        control={adminForm.control}
                        name="organisationPostalCode"
                        id="organisationPostalCode"
                        label="Postal code"
                        autoComplete="postal-code"
                        placeholder="Enter postal code"
                      />
                      {/* Country */}
                      <OnboardingTextField
                        control={adminForm.control}
                        name="organisationCountry"
                        id="organisationCountry"
                        label="Country"
                        autoComplete="country-name"
                        placeholder="Enter country"
                      />
                    </>
                  )}

                  {/* Contact information */}
                  {step === "admin-contact" && (
                    <>
                      <h2 className="text-xl font-semibold text-foreground">
                        Contact information
                      </h2>
                      <p className="mt-1 mb-6 text-sm text-muted-foreground">
                        Provide the admin contact details for this onboarding request.
                      </p>
                      {/* Contact email */}
                      <OnboardingTextField
                        control={adminForm.control}
                        name="contactEmail"
                        id="contactEmail"
                        label="Contact email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter contact email"
                      />
                      {/* Contact phone */}
                      <OnboardingTextField
                        control={adminForm.control}
                        name="contactPhone"
                        id="contactPhone"
                        label="Contact phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Enter contact phone number"
                      />
                    </>
                  )}

                  {/* Review the details */}
                  {step === "admin-review" && (
                    <>
                      <h2 className="text-xl font-semibold text-foreground">Check the details</h2>
                      <p className="mt-1 mb-6 text-sm text-muted-foreground">
                        Review everything before submitting. Use Previous to make changes.
                      </p>
                      {/* Review rows for the admin onboarding process */}
                      <div className="divide-y divide-border">
                        {adminReviewRows.map(([label, value]) => (
                          <div
                            key={label}
                            className="flex items-start justify-between gap-4 py-3 text-sm"
                          >
                            <span className="shrink-0 text-muted-foreground">{label}</span>
                            <span className="text-right font-medium text-foreground break-words">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>
                {/* The Previous and Next buttons */}
                <OnboardingNav
                  isFirstStep={step === "admin-organisation"}
                  isSubmitStep={step === "admin-review"}
                  loading={isCreatingOnboarding}
                  onBack={handleBack}
                  onNext={
                    step === "admin-review"
                      ? () => void handleAdminSubmit()
                      : () => void handleAdminNext()
                  }
                />
              </form>
            </Form>
          )}

          {/* The admin complete message */}
          {isAdminComplete && (
            <div className="px-2 py-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Hourglass className="size-7" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Registration submitted</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your registration is in review. An admin will verify the details shortly, then
                you can start using the platform.
              </p>
            </div>
          )}

          {isTeacherStep && (
            <Form {...teacherForm}>
              <form onKeyDown={handleFormKeyDown} noValidate>
                <section ref={paneRef} className="animate-in fade-in-0 slide-in-from-right-2 duration-300">
                  {/* School registration ID */}
                  {step === "teacher-regId" && (
                    <>
                      <h2 className="text-xl font-semibold text-foreground">
                        What&apos;s your school registration ID?
                      </h2>
                      <p className="mt-1 mb-6 text-sm text-muted-foreground">
                        Use the official registration ID from your school admin.
                      </p>
                      {/* School registration ID */}
                      <OnboardingTextField
                        control={teacherForm.control}
                        name="schoolRegistrationId"
                        id="schoolRegistrationId"
                        label="School registration ID"
                        autoComplete="organization"
                        placeholder="Enter school registration ID"
                      />
                    </>
                  )}

                  {/* Review the details */}
                  {step === "teacher-review" && (
                    <>
                      <h2 className="text-xl font-semibold text-foreground">Check the details</h2>
                      <p className="mt-1 mb-6 text-sm text-muted-foreground">
                        Review everything before submitting. Use Previous to make changes.
                      </p>
                      <div className="divide-y divide-border">
                        {teacherReviewRows.map(([label, value]) => (
                          <div
                            key={label}
                            className="flex items-start justify-between gap-4 py-3 text-sm"
                          >
                            <span className="shrink-0 text-muted-foreground">{label}</span>
                            <span className="text-right font-medium text-foreground break-words">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* The Previous and Next buttons */}
                  <OnboardingNav
                    isFirstStep={step === "teacher-regId"}
                    isSubmitStep={step === "teacher-review"}
                    loading={isCreatingJoinRequest}
                    onBack={handleBack}
                    onNext={
                      step === "teacher-review"
                        ? () => void handleTeacherSubmit()
                        : () => void handleTeacherNext()
                    }
                  />
                </section>
              </form>
            </Form>
          )}

          {/* The teacher complete message */}
          {isTeacherComplete && (
            <div className="px-2 py-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Hourglass className="size-7" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Request submitted</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your join request has been sent to the school admin. They will review it and get
                back to you shortly.
              </p>
            </div>
          )}

          {/* Rejected message (Regardless of role) */}
          {step === "request-rejected" && (
            <div className="px-2 py-8 text-center">
              <h2 className="text-xl font-semibold text-foreground">Registration rejected</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your registration has been rejected. {rejectionReason && <span>Reason: {rejectionReason}</span>}
              </p>
              <Button variant="outline" onClick={handleTryAgain}>Try again</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}