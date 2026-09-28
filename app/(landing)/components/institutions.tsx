"use client";

import { useEffect, useRef } from "react";
import { clientInstitutions } from "../data/landing-data";
import { SectionHead, Shell } from "./landing-ui";

function CountUp({
  target,
  decimals = 0,
  suffix = "",
}: {
  target: number;
  decimals?: number;
  suffix?: string;
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
          el.textContent = target.toFixed(decimals) + suffix;
          return;
        }

        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          el.textContent =
            (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function Institutions() {
  const chips = [...clientInstitutions];

  return (
    <section id="institutions" className="py-[clamp(56px,7vw,104px)]">
      <Shell>
        <SectionHead
          // eyebrow="Twelve months to August 2026"
          title="Our Numbers so far..."
          description="We are a growing sartup on a mission to revolutionise education in Nigeria and across Africa."
        />

        <div className="mt-[38px] grid grid-cols-3 gap-3.5 max-[1040px]:grid-cols-2 max-[560px]:grid-cols-1">
          {/* Institutions count */}
          <FigureCard
            number={<CountUp target={3} />}
            label="institutions"
            sub="Primary and Secondary schools."
          >
            <div className="flex h-2 gap-0.5">
              <i className="block flex-[1] rounded-sm bg-chart-1" />
              <i className="block flex-[1] rounded-sm bg-chart-2" />
              <i className="block flex-[1] rounded-sm bg-chart-3" />
            </div>
            <Legend items={[
              ["chart-1", "Nursery Schools"],
              ["chart-2", "Primary Schools"],
              ["chart-3", "Secondary Schools"],
            ]} />
          </FigureCard>

          {/* Uptime through results week */}
          <FigureCard
            number={
              <>
                <CountUp target={99.99} decimals={2} />
                %
              </>
            }
            label="uptime through results week"
            sub="Highly Scalable and Available Infrastructure"
          >
            <div className="flex h-[46px] items-end gap-[5px]">
              {[100, 100, 94, 100, 100, 100, 100].map((h, i) => (
                <i
                  key={i}
                  className={`block flex-1 rounded-t-sm ${h < 100 ? "bg-chart-4" : "bg-chart-1"}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <Legend items={[["", "Seven release days, one four-minute dip"]]} single />
          </FigureCard>

          {/* States where we are */}
          <FigureCard
            number={<CountUp target={3} />}
            label="states and growing..."
            sub="Data held securely and redundantly across multiple zones."
          >
            <div className="flex flex-wrap gap-1">
              {["BENUE", "RIVERS", "FCT"].map(
                (code) => (
                  <span
                    key={code}
                    className={`rounded-sm px-1.5 py-0.5 font-mono text-[0.66rem] ${["BENUE", "RIVERS", "FCT"].includes(code)
                      ? "bg-accent font-medium text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {code}
                  </span>
                )
              )}
            </div>
          </FigureCard>
        </div>

        <div className="landing-marquee mt-[34px] overflow-hidden border-y border-border py-[18px]">
          <p className="mb-3.5 text-[0.78rem] text-muted-foreground">
            Institutions running their results on AiD
          </p>
          <div className="landing-track flex w-max gap-3">
            {chips.map(([name, colour], i) => (
              <span
                key={`${name}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-[0.88rem] font-medium text-muted-foreground"
              >
                <i className="block size-4 shrink-0 rounded-sm" style={{ background: colour }} />
                {name}
              </span>
            ))}
          </div>
        </div>
      </Shell>
    </section>
  );
}

function FigureCard({
  number,
  label,
  sub,
  children,
}: {
  number: React.ReactNode;
  label: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="text-[clamp(1.9rem,3.4vw,2.6rem)] font-extrabold tabular-nums leading-none tracking-[-0.035em]">
        {number}
      </div>
      <div className="mt-1.5 text-[0.9rem] font-semibold">{label}</div>
      <div className="mt-1.5 text-[0.82rem] text-muted-foreground">{sub}</div>
      <div className="mt-auto pt-[18px]">{children}</div>
    </div>
  );
}

function Legend({
  items,
  single = false,
}: {
  items: [string, string][];
  single?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem] text-muted-foreground">
      {items.map(([colour, label]) => (
        <span key={label} className="flex items-center gap-1.5">
          {!single && colour && (
            <i
              className="block size-[7px] rounded-sm"
              style={{ background: `var(--${colour})` }}
            />
          )}
          {label}
        </span>
      ))}
    </div>
  );
}
