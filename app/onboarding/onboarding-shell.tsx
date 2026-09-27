"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Hourglass,
  XCircle,
} from "lucide-react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { LoadingButton } from "@/shared-components/loading-button";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/shadcn/ui/card";
import { Field, FieldLabel } from "@/shadcn/ui/field";
import { FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Separator } from "@/shadcn/ui/separator";
import { cn } from "@/lib/utils";

export type OnboardingStep = {
  id: number;
  title: string;
  icon: LucideIcon;
};

type OnboardingShellProps = {
  steps: readonly OnboardingStep[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function OnboardingShell({
  steps,
  currentStep,
  onStepClick,
  children,
  footer,
}: OnboardingShellProps) {
  const total = steps.length;
  const progress = (currentStep / total) * 100;

  return (
    <Card className="mx-auto w-full max-w-2xl border shadow-md">
      <CardHeader className="gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {/* <GraduationCap className="size-6 shrink-0 text-primary" aria-hidden /> */}
            <span className="text-sm font-semibold tracking-tight">AiD</span>
          </div>
          <Badge variant="secondary">
            Step {currentStep} of {total}
          </Badge>
        </div>

        <div className="space-y-3">
          <div
            className="relative h-2 w-full overflow-hidden rounded-full bg-primary/15"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={`Step ${currentStep} of ${total}`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ol className="flex items-center justify-between">
            {steps.map((step) => {
              const active = step.id === currentStep;
              const done = step.id < currentStep;
              const Icon = step.icon;

              return (
                <li key={step.id} className="flex flex-1 justify-center">
                  <button
                    type="button"
                    disabled={!done || !onStepClick}
                    onClick={() => done && onStepClick?.(step.id)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 text-center transition-opacity focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                      done && onStepClick ? "cursor-pointer hover:opacity-80" : "cursor-default",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                        active && "border-primary bg-primary text-primary-foreground",
                        done && "border-primary/40 bg-primary/10 text-primary",
                        !active &&
                          !done &&
                          "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {done ? (
                        <Check className="size-4" aria-hidden />
                      ) : (
                        <Icon className="size-4" aria-hidden />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </CardHeader>

      <CardContent className="min-h-64">{children}</CardContent>

      {footer ? (
        <CardFooter className="justify-between gap-3 border-t pt-6">{footer}</CardFooter>
      ) : null}
    </Card>
  );
}

type OnboardingTextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  id: string;
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
};

export function OnboardingTextField<T extends FieldValues>({
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
        <FormItem>
          <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                id={id}
                type={type}
                autoComplete={autoComplete}
                placeholder={placeholder}
              />
            </FormControl>
            <FormMessage />
          </Field>
        </FormItem>
      )}
    />
  );
}

type OnboardingNavProps = {
  isFirstStep: boolean;
  isSubmitStep: boolean;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
  submitLabel?: string;
};

export function OnboardingNav({
  isFirstStep,
  isSubmitStep,
  loading,
  onBack,
  onNext,
  submitLabel = "Submit registration",
}: OnboardingNavProps) {
  return (
    <>
      <Button type="button" variant="outline" onClick={onBack} disabled={isFirstStep || loading}>
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </Button>
      <LoadingButton type="button" loading={loading} onClick={onNext}>
        {isSubmitStep ? submitLabel : "Next"}
        {!isSubmitStep ? <ArrowRight className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />}
      </LoadingButton>
    </>
  );
}

export function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5 space-y-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function SummaryPanel({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <dl className="space-y-3 text-sm">
        {rows.map(([label, value], index) => (
          <div key={label}>
            {index > 0 ? <Separator className="mb-3" /> : null}
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium break-words">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function OnboardingCompleteState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Hourglass className="size-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function OnboardingRejectedState({
  rejectionReason,
  onTryAgain,
}: {
  rejectionReason: string | null;
  onTryAgain: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        <XCircle className="size-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Registration rejected</h2>
        <p className="text-sm text-muted-foreground">
          Your registration has been rejected.
          {rejectionReason ? ` Reason: ${rejectionReason}` : ""}
        </p>
      </div>
      <Button type="button" variant="outline" onClick={onTryAgain}>
        Try again
      </Button>
    </div>
  );
}