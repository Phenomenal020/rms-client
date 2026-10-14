"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import { cn } from "@/lib/utils";
import type { LegalSection } from "../data/legal-modals-content";

type LegalScrollModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  effectiveDate?: string;
  intro?: string;
  subtitle?: string;
  sections: LegalSection[];
};

function SectionBlock({ section }: { section: LegalSection }) {
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold text-foreground">{section.heading}</h3>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-muted-foreground">
          {paragraph}
        </p>
      ))}
      {section.bullets && section.bullets.length > 0 && (
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {section.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function LegalScrollModal({
  open,
  onOpenChange,
  title,
  effectiveDate,
  intro,
  subtitle,
  sections,
}: LegalScrollModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(85vh,720px)] flex-col gap-0 overflow-hidden p-0",
          "sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 py-5 pr-12 text-left">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {effectiveDate && (
            <p className="text-sm text-muted-foreground">Effective date: {effectiveDate}</p>
          )}
          {subtitle && (
            <p className="text-sm font-medium leading-relaxed text-foreground/90">{subtitle}</p>
          )}
          {intro && !subtitle && (
            <p className="text-sm leading-relaxed text-muted-foreground">{intro}</p>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {intro && subtitle && (
              <p className="text-sm leading-relaxed text-muted-foreground">{intro}</p>
            )}
            {sections.map((section) => (
              <SectionBlock key={section.heading} section={section} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
