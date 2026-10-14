"use client";

import Image from "next/image";
import { BtnGhost, BtnPrimary, Shell } from "./landing-ui";

export function Hero() {
  return (
    <section className="relative overflow-x-clip py-[clamp(44px,6vw,84px)] pb-[clamp(52px,7vw,96px)] before:pointer-events-none before:absolute before:inset-[-40%_40%_40%_-20%] before:bg-[radial-gradient(closest-side,var(--accent),transparent_70%)] before:opacity-70" id="hero">

      {/* Hero container */}
      <Shell className="relative grid min-w-0 grid-cols-1 items-center gap-[clamp(32px,5vw,64px)] lg:grid-cols-2 lg:gap-10">
        <div className="min-w-0">
          {/* Hero title */}
          <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold tracking-[-0.02em] leading-[1.2] text-center lg:text-left  max-w-[640px] lg:max-w-[1024px] mx-auto">
            Smart, Scalable, and Secure Result Management Solution for Institutions
          </h1>

          {/* Hero description */}
          <p className="mt-5 max-w-[640px] lg:max-w-[1024px] text-[clamp(1rem,2.5vw,1.1rem)] text-muted-foreground text-center lg:text-left mx-auto">
            Introducing a premier Result Management Solution for schools and colleges, purposefully designed to scale with your institution&apos;s needs.
          </p>

          {/* Hero buttons */}
          <div className="mt-7 flex flex-wrap gap-2 justify-center lg:justify-start">
            <BtnPrimary href="#contact-form">Book a demo</BtnPrimary>
            <BtnGhost href="/sign-in">Get Started</BtnGhost>
          </div>
        </div>
      </Shell>
    </section>
  );
}