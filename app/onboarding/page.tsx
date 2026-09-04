import { OnboardingForm } from "./onboarding-wrapper";
import { OnboardingGate, OnboardingLoading } from "@/shared-components/onboarding-gate";


export const metadata = {
  title: "Onboarding",
  description: "Complete your school setup",
};

export default function OnboardingPage() {
  return (
    <OnboardingGate fallback={<OnboardingLoading />}>
      <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
        <OnboardingForm />
      </main>
    </OnboardingGate>
  );
}
