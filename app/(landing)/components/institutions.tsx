"use client";

import { useEffect, useRef } from "react";
// import { clientInstitutions } from "../data/landing-data";
import { SectionHead, Shell } from "./landing-ui";
import { ourNumbers } from "../data/landing-data";

function CountUp({
  target,
  decimals = 0,
  suffix = "",
  prefix = "",
}: {
  target: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  // use effect to count up the number
  useEffect(() => {
    const el = ref.current;
    if (!el || counted.current) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = 1100;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        counted.current = true;
        observer.disconnect();

        if (reduce) {
          el.textContent = prefix + (target as number).toFixed(decimals) + suffix;
          return;
        }

        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          el.textContent =
            prefix + ((target as number) * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals, suffix, prefix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

export function Institutions() {
  // const chips = [...clientInstitutions];

  return (
    <section id="institutions" className="py-[clamp(56px,7vw,104px)]">
      <Shell>
        <SectionHead
          // eyebrow="Twelve months to August 2026"
          title="Our Numbers so far"
          description="We are a growing startup on a mission to revolutionise education in Nigeria and across Africa."
        />

        <div className="mt-[38px] grid grid-cols-4 gap-3 max-[1024px]:grid-cols-2 max-[480px]:grid-cols-1">
          {/* Teachers count */}
          <FigureCard
            number={<CountUp target={ourNumbers.teachers} suffix="+" />}
            label="users"
            sub="Teachers using our product to manage their results."
          >
          </FigureCard>

          {/* Schools count */}
          <FigureCard
            number={<CountUp target={ourNumbers.institutions} />}
            label="schools and growing..."
            sub="Schools that trust us with their results."
          >
          </FigureCard>

          {/* Availability */}
          <FigureCard
            number={
              <>
                <CountUp target={ourNumbers.availability_sla} decimals={2} />
                %
              </>
            }
            label="availability"
            sub="Highly Scalable and Available Infrastructure"
          >
          </FigureCard>

          {/* Sustainable commitment */}
          <FigureCard
            number={<CountUp target={ourNumbers.sustainable_commitment} prefix="NGN" />}
            label="sustainable commitment"
            sub="Cashback pledged to schools on our sustainable plan."
          >
          </FigureCard>
        </div>
      </Shell>
    </section>
  );
}

function FigureCard({
  number,
  label,
  sub,
  // children,
}: {
  number: React.ReactNode;
  label: string;
  sub: string;
  // children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="text-[clamp(1.9rem,3.4vw,2.6rem)] font-extrabold tabular-nums leading-none tracking-[-0.035em]">
        {number}
      </div>
      <div className="mt-1.5 text-[0.9rem] font-semibold">{label}</div>
      <div className="mt-1.5 text-[0.82rem] text-muted-foreground">{sub}</div>
    </div>
  );
}