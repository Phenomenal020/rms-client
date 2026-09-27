import { z } from "zod";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Skeleton } from "@/shadcn/ui/skeleton";

// Onboarding schema for admins
export const onboardingSchemaAdmin = z.object({
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
    .regex(/^(\d{11}|\+\d{11,12})$/, {
      message: "Enter 11 digits, or + followed by 11–12 digits including country code",
    })
    .max(16, { message: "Contact phone must not be more than 16 characters" }),
});
export type OnboardingFormValuesAdmin = z.input<typeof onboardingSchemaAdmin>;

// Onboarding schema for regular teachers
export const onboardingSchemaTeacher = z.object({
  schoolRegistrationId: z.string().trim().min(1, {
    message: "Please enter a valid school registration ID or contact your school admin",
  }),
});
export type OnboardingFormValuesTeacher = z.input<typeof onboardingSchemaTeacher>;

// Show value or "-"
export function displayValue(value: string | null | undefined, fallback = "—") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

// Get better auth HTTP status
export function getBetterAuthHttpStatus(err: unknown): number | undefined {
  const status =
    (err as { status?: number })?.status ??
    (err as { response?: { status?: number } })?.response?.status;
  return typeof status === "number" ? status : undefined;
}

// Onboarding form skeleton
export function OnboardingFormSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-2xl border shadow-md">
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="size-8 rounded-full" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}