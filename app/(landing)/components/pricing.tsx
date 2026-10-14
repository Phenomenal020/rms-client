import { pricingPlans } from "../data/landing-data";
import { BtnGhost, BtnPrimary, SectionHead, Shell } from "./landing-ui";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="py-[clamp(56px,7vw,104px)]">
      <Shell>
        {/* Section header */}
        <SectionHead
          title="Flexible pricing for your institution"
          description="Pick the plan that best suits your school needs — or contact us when you need something bespoke."
        />

        {/* Pricing plans */}
        <ul className="mt-[50px] grid list-none gap-4 p-0 lg:grid-cols-3 lg:items-stretch lg:gap-5">
          {pricingPlans.map((plan) => (
            // id
            <li key={plan.id} className="flex min-w-0">
              <article
                className={cn(
                  "relative flex w-full flex-col rounded-[calc(var(--radius)+10px)] border border-border bg-card p-[clamp(22px,3vw,28px)] shadow-sm",
                  plan.highlighted &&
                  "border-primary shadow-md ring-1 ring-primary/20 lg:-translate-y-1 lg:shadow-lg"
                )}
              >
                {/* 50% badge */}
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[0.72rem] font-bold uppercase tracking-wide text-primary-foreground">
                    {plan.badge}
                  </span>
                )}

                {/* Name and tagline */}
                <header>
                  <h3 className="text-[1.25rem] font-bold tracking-[-0.02em]">{plan.name}</h3>
                  <p className="mt-1.5 text-[0.9rem] text-muted-foreground">{plan.tagline}</p>
                </header>

                {/* Price and detail */}
                <div className="mt-5 border-b border-border pb-5">
                  <p className="text-[clamp(1.2rem,2.5vw,1.35rem)] font-extrabold tracking-[-0.02em]">
                    {plan.priceLabel}
                  </p>
                  {plan.priceDetail && (
                    <p className="mt-1 text-[0.85rem] text-muted-foreground">{plan.priceDetail}</p>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 list-none p-0">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[0.92rem] leading-snug">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                      >
                        <path d="M4 12.5l5 5 11-11" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-6 pt-2">
                  {plan.highlighted ? (
                    <BtnPrimary href="#contact" className="w-full">
                      {plan.cta}
                    </BtnPrimary>
                  ) : (
                    <BtnGhost href="#contact" className="w-full">
                      {plan.cta}
                    </BtnGhost>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Shell>
    </section>
  );
}
