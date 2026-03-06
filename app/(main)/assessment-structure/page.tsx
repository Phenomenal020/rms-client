"use client";

import { useUser } from "@/contexts/user-context";
import { AssessmentStructureForm } from "./assessment-structure-form";

export default function AssessmentStructurePage() {
  const { assessmentStructure, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <main className="min-h-screen w-full bg-background relative overflow-hidden">
        <div className="relative mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
          <p className="text-sm text-muted-foreground">Loading assessment structure...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load your settings. Please refresh the page.
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">

      <div className="relative mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16">

        {/* Header Section - Assessment Structure + paragraph */}
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
            Assessment Structure
          </h1>
        </div>

        <AssessmentStructureForm assessmentStructure={assessmentStructure} />
      </div>
    </main>
  );
}
