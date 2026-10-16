"use client";

import { BrandLogoFull, Shell } from "./landing-ui";
import { CompanyLegalModals, useCompanyLegalModals, type CompanyLegalModal } from "./company-legal-modals";

const productLinks = [
  { href: "#pipeline", label: "The pipeline" },
  { href: "#institutions", label: "Our Numbers" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "FAQs" },
];

type CompanyLink =
  | { type: "anchor"; href: string; label: string }
  | { type: "modal"; modal: CompanyLegalModal; label: string };

const companyLinks: CompanyLink[] = [
  { type: "modal", modal: "about", label: "About" },
  { type: "modal", modal: "privacy", label: "Privacy Policy" },
  // { type: "modal", modal: "terms", label: "Terms of Service" },
  { type: "anchor", href: "#contact-form", label: "Contact Us" },
];

export function Footer() {
  const { active, setActive, open } = useCompanyLegalModals();

  return (
    <footer className="border-t border-border bg-background pb-[26px] pt-12">
      <Shell>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,44%)_minmax(0,56%)] gap-8 w-full">
          {/* Brand and description */}
          <div className="flex flex-col gap-3 sm:w-full">
            {/* <BrandLink className="mr-0" /> */}
            <BrandLogoFull className="mr-0" />
            <p className="mt-3.5 text-[0.9rem] text-muted-foreground md:max-w-none">
              Smart, scalable, and secure result management for institutions with flexible pricing rules to meet business needs.
            </p>
          </div>

          <div className="flex gap-3 justify-between sm:w-full">
            {/* Product links */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[1rem] font-semibold text-muted-foreground">Product</h3>
              <ul className="list-none p-0">
                {productLinks.map((link) => (
                  <li key={link.label} className="mt-2">
                    <a
                      href={link.href}
                      className="text-[0.9rem] no-underline opacity-85 hover:text-primary hover:opacity-100"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              {/* Company links */}
              <h3 className="text-[1rem] font-semibold text-muted-foreground">Company</h3>
              <ul className="list-none p-0">
                {companyLinks.map((link) => (
                  <li key={link.label} className="mt-2">
                    {link.type === "modal" ? (
                      <button
                        type="button"
                        onClick={() => open(link.modal)}
                        className="cursor-pointer border-0 bg-transparent p-0 text-left text-[0.9rem] text-inherit no-underline opacity-85 hover:text-primary hover:opacity-100"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-[0.9rem] no-underline opacity-85 hover:text-primary hover:opacity-100"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 border-t border-border pt-5 text-[0.82rem] text-muted-foreground">
          <span>© 2026 AiD Systems Ltd.</span>
        </div>
      </Shell>

      <CompanyLegalModals active={active} onActiveChange={setActive} />
    </footer>
  );
}
