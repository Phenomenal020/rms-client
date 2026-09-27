"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { testimonials } from "../data/landing-data";
import { IconBtn, SectionHead, Shell } from "./landing-ui";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const getCurrentIndex = useCallback(() => {
    const rail = railRef.current;
    if (!rail || rail.children.length === 0) return 0;
    const first = rail.children[0] as HTMLElement;
    let best = 0;
    let min = Infinity;
    Array.from(rail.children).forEach((c, i) => {
      const el = c as HTMLElement;
      const d = Math.abs(el.offsetLeft - first.offsetLeft - rail.scrollLeft);
      if (d < min) {
        min = d;
        best = i;
      }
    });
    return best;
  }, []);

  const goTo = useCallback((index: number) => {
    const rail = railRef.current;
    if (!rail || rail.children.length === 0) return;
    const first = rail.children[0] as HTMLElement;
    const target = rail.children[index] as HTMLElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({
      left: target.offsetLeft - first.offsetLeft,
      behavior: reduce ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onScroll = () => setActiveIndex(getCurrentIndex());
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => rail.removeEventListener("scroll", onScroll);
  }, [getCurrentIndex]);

  return (
    <section id="reviews" className="border-y border-border bg-muted py-[clamp(56px,7vw,104px)]">
      <Shell>
        <div className="flex flex-wrap items-end justify-between gap-5">
        <SectionHead
          // eyebrow="Twelve months to August 2026"
          title="From the people who use AiD..."
          description="Hear from our customers about their experience using AiD to manage their results."
        />

          {/* Navigation buttons */}
          <div className="flex gap-2">
            <IconBtn
              aria-label="Previous review"
              onClick={() => goTo(Math.max(0, activeIndex - 1))}
              className="cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </IconBtn>
            <IconBtn
              aria-label="Next review"
              onClick={() => goTo(Math.min(testimonials.length - 1, activeIndex + 1))}
              className="cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </IconBtn>
          </div>
        </div>

        <div
          ref={railRef}
          tabIndex={0}
          aria-label="Customer reviews"
          className="mt-[34px] flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex w-[min(400px,84vw)] shrink-0 snap-start flex-col rounded-[calc(var(--radius)+10px)] border border-border bg-card p-6"
            >
              {/* <div className="mb-[18px] flex items-baseline gap-2.5 border-b border-border pb-4">
                <b className="whitespace-nowrap font-mono text-[1.45rem] font-medium tracking-[-0.02em] text-primary">
                  {t.metric}
                </b>
                <span className="text-[0.8rem] leading-snug text-muted-foreground">
                  {t.metricLabel}
                </span>
              </div> */}
              <blockquote className="m-0 text-base leading-[1.62] mb-3">{t.quote}</blockquote>
              <figcaption className="mt-auto flex items-center gap-[11px] pt-[22px]">
                <span
                  className="grid size-[34px] shrink-0 place-items-center rounded-lg text-[0.7rem] font-extrabold text-white"
                  style={{ background: t.colour }}
                >
                  {t.initials}
                </span>
                <span>
                  <span className="block text-[0.9rem] font-semibold leading-snug">{t.name}</span>
                  <span className="block text-[0.8rem] text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="mt-[22px] flex justify-center gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to review ${i + 1}`}
              aria-current={activeIndex === i}
              onClick={() => goTo(i)}
              className={cn(
                "h-[7px] cursor-pointer rounded-full border-0 bg-border p-0 transition-all duration-200",
                activeIndex === i ? "w-[22px] bg-primary" : "w-[7px]"
              )}
            />
          ))}
        </div>
      </Shell>
    </section>
  );
}
