"use client";

import { useState } from "react";
import { LegalScrollModal } from "./legal-scroll-modal";
import {
  aboutModalContent,
  privacyModalContent,
  termsModalContent,
} from "../data/legal-modals-content";

export type CompanyLegalModal = "about" | "privacy" | "terms";

export function CompanyLegalModals({
  active,
  onActiveChange,
}: {
  active: CompanyLegalModal | null;
  onActiveChange: (modal: CompanyLegalModal | null) => void;
}) {
  const setOpen = (key: CompanyLegalModal) => (open: boolean) => {
    onActiveChange(open ? key : null);
  };

  return (
    <>
      <LegalScrollModal
        open={active === "about"}
        onOpenChange={setOpen("about")}
        title={aboutModalContent.title}
        subtitle={aboutModalContent.subtitle}
        sections={aboutModalContent.sections}
      />
      <LegalScrollModal
        open={active === "privacy"}
        onOpenChange={setOpen("privacy")}
        title={privacyModalContent.title}
        effectiveDate={privacyModalContent.effectiveDate}
        intro={privacyModalContent.intro}
        sections={privacyModalContent.sections}
      />
      <LegalScrollModal
        open={active === "terms"}
        onOpenChange={setOpen("terms")}
        title={termsModalContent.title}
        effectiveDate={termsModalContent.effectiveDate}
        intro={termsModalContent.intro}
        sections={termsModalContent.sections}
      />
    </>
  );
}

export function useCompanyLegalModals() {
  const [active, setActive] = useState<CompanyLegalModal | null>(null);
  return { active, setActive, open: (modal: CompanyLegalModal) => setActive(modal) };
}
