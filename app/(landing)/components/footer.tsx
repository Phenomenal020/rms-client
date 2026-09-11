import { BrandLink, Shell } from "./landing-ui";

const footerLinks = {
  Product: [
    { href: "#about", label: "The pipeline" },
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#contact", label: "Contact" },
  ],
  // "For institutions": [
  //   { href: "#contact", label: "Migrating your data" },
  //   { href: "#contact", label: "Onboarding" },
  //   { href: "#contact", label: "Status page" },
  //   { href: "#contact", label: "Help centre" },
  // ],
  Company: [
    { href: "#institutions", label: "Our Numbers" },
    { href: "#contact", label: "Contact" },
    { href: "#contact", label: "Privacy" },
    { href: "#contact", label: "Terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted pb-[26px] pt-12">
      <Shell>
        <div className="grid grid-cols-[1.5fr_repeat(2,1fr)] gap-8 max-[1040px]:grid-cols-2 max-[560px]:grid-cols-1">
          <div>
            <BrandLink className="mr-0" />
            <p className="mt-3.5 max-w-[34ch] text-[0.9rem] text-muted-foreground">
              Result management for institutions that keep their own records and their own
              rules.
            </p>
            {/* <span className="mt-[18px] inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[0.78rem] font-medium">
              <i className="block size-[7px] rounded-full bg-[var(--ok)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--ok)_20%,transparent)]" />
              All tenants operational
            </span> */}
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[0.82rem] font-semibold text-muted-foreground">{title}</h4>
              <ul className="mt-3 list-none p-0">
                {links.map((link) => (
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
          ))}
        </div>
        <div className="mt-11 flex flex-wrap justify-between gap-3 border-t border-border pt-5 text-[0.82rem] text-muted-foreground">
          <span>© 2026 AiD Systems Ltd.</span>
          <span>Data held securely and redundantly across multiple zones.</span>
        </div>
      </Shell>
    </footer>
  );
}
