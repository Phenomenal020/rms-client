"use client";

import { BtnGhost, BtnPrimary, Shell } from "./landing-ui";
import { BeforeAfter } from "./hero-before-after";

export function Hero() {
  return (
    <section
      className="relative overflow-x-clip py-[clamp(44px,6vw,84px)] pb-[clamp(52px,7vw,96px)] before:pointer-events-none before:absolute before:inset-[-40%_40%_40%_-20%] before:bg-[radial-gradient(closest-side,var(--accent),transparent_70%)] before:opacity-70"
      id="hero"
    >
      <Shell className="relative grid min-w-0 grid-cols-1 items-center gap-[clamp(32px,5vw,64px)] lg:grid-cols-2 lg:gap-10">
        <div>
          <div className="min-w-0 border-b border-b-muted-foreground/10 pb-4">
            <h1 className="mx-auto max-w-[640px] text-center text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.02em] lg:mx-0 lg:max-w-[1024px] lg:text-left">
              Smart, Scalable, and Secure Result Management Solution for Institutions
            </h1>

            <p className="mx-auto mt-5 max-w-[640px] text-center text-[clamp(1rem,2.5vw,1.1rem)] text-muted-foreground lg:mx-0 lg:max-w-[1024px] lg:text-left">
              Introducing a premier Result Management Solution for schools and colleges, purposefully designed to scale with your institution&apos;s needs.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
              <BtnPrimary href="#contact-form">Book a demo</BtnPrimary>
              <BtnGhost href="/sign-up">Get Started</BtnGhost>
            </div>
          </div>

          <div className="hidden md:flex gap-2 justify-between">
            <h2 className="text-2xl font-bold flex flex-col text-left py-4">80% <span className="text-muted-foreground text-sm font-normal">less time to generate results</span></h2>
            <h2 className="text-2xl font-bold flex flex-col text-left py-4">0 <span className="text-muted-foreground text-sm font-normal">paper needed</span></h2>
            <h2 className="text-2xl font-bold flex flex-col text-left py-4">10 years <span className="text-muted-foreground text-sm font-normal">on demand data access</span></h2>
          </div>
        </div>

        <div className="min-w-0 lg:justify-self-end lg:w-full lg:max-w-[640px]">
          <BeforeAfter />
        </div>
      </Shell>
    </section>
  );
}
