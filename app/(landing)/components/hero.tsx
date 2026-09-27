"use client";

import { useCallback, useState } from "react";
import { tenants } from "../data/landing-data";
import { BtnGhost, BtnPrimary, Shell } from "./landing-ui";
import { cn } from "@/lib/utils";

export function Hero() {
  const [activeTenant, setActiveTenant] = useState(0);
  const [animateRows, setAnimateRows] = useState(true);
  const tenant = tenants[activeTenant];

  const selectTenant = useCallback((index: number) => {
    setActiveTenant(index);
    setAnimateRows(true);
  }, []);

  return (
    <section className="relative overflow-hidden py-[clamp(44px,6vw,84px)] pb-[clamp(52px,7vw,96px)] before:pointer-events-none before:absolute before:inset-[-40%_40%_40%_-20%] before:bg-[radial-gradient(closest-side,var(--accent),transparent_70%)] before:opacity-70">
      <Shell className="relative grid items-center gap-[clamp(32px,5vw,64px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div>
          {/* Banner Text */}
          <h1 className="text-[clamp(2.2rem,4.6vw,3rem)] font-extrabold tracking-[-0.02em] leading-[1.12]">
            Smart, Scalable, and Secure Result Management Solution for Institutions
          </h1>

          {/* Marketing text */}
          <p className="mt-5 max-w-[46ch] text-[1.1rem] text-muted-foreground">
            Introducing a premier Result Management Solution for schools and colleges, purposefully designed to scale with your institution's needs.
          </p>

          {/* Book demo and Get started buttons */}
          <div className="mt-7 flex flex-wrap gap-2.5">
            <BtnPrimary href="#contact">Book a demo</BtnPrimary>
            <BtnGhost href="#about">Get Started</BtnGhost>
          </div>
        </div>

        <div>
          <div
            className="mb-3 flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Choose an institution"
          >
            {/* Todo: Replace this with images of - Subject View, Student view, Custom template... */}
            {tenants.map((t, i) => (
              <button
                key={t.domain}
                type="button"
                role="tab"
                aria-selected={activeTenant === i}
                aria-controls="tenant-sheet"
                id={`tab-${i}`}
                onClick={() => selectTenant(i)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const next =
                    (i + (e.key === "ArrowRight" ? 1 : tenants.length - 1)) %
                    tenants.length;
                  selectTenant(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3.5 py-[7px] text-[0.84rem] font-medium text-muted-foreground transition-[background,border-color,color] hover:border-muted-foreground hover:text-foreground",
                  activeTenant === i &&
                  "border-foreground bg-foreground font-semibold text-background"
                )}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: t.colour }}
                />
                {t.tabLabel}
              </button>
            ))}
          </div>

          <div
            id="tenant-sheet"
            role="tabpanel"
            aria-labelledby={`tab-${activeTenant}`}
            tabIndex={0}
            className="overflow-hidden rounded-[calc(var(--radius)+10px)] border border-border bg-card text-card-foreground shadow-lg"
            style={{ ["--tenant" as string]: tenant.colour }}
          >
            <div className="h-[3px] bg-[var(--tenant,var(--primary))]" />
            <div className="flex items-center gap-3 px-5 pb-4 pt-[18px] max-[560px]:px-3.5">
              <div
                className="grid size-10 shrink-0 place-items-center rounded-lg text-[0.9rem] font-extrabold text-white"
                style={{ background: tenant.colour }}
              >
                {tenant.initials}
              </div>
              <div>
                <div className="text-base font-semibold leading-tight">{tenant.org}</div>
                <div className="mt-0.5 font-mono text-[0.74rem] text-muted-foreground">
                  {tenant.domain}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap border-y border-border bg-muted">
              {tenant.meta.map(([k, v]) => (
                <div
                  key={k}
                  className="flex-1 border-r border-border px-5 py-2.5 last:border-r-0 max-[560px]:basis-1/2 max-[560px]:border-b max-[560px]:border-r-0"
                >
                  <div className="text-[0.68rem] font-semibold text-muted-foreground">{k}</div>
                  <div className="mt-0.5 font-mono text-[0.8rem]">{v}</div>
                </div>
              ))}
            </div>

            <table className="w-full border-collapse text-[0.9rem]">
              <thead>
                <tr>
                  <th className="border-b border-border px-5 py-[11px] pb-2 text-left text-[0.7rem] font-semibold text-muted-foreground max-[560px]:px-3.5">
                    {tenant.cols[0]}
                  </th>
                  <th className="w-20 border-b border-border px-5 py-[11px] pb-2 text-right font-mono text-[0.7rem] font-semibold tabular-nums text-muted-foreground max-[560px]:px-3.5">
                    {tenant.cols[1]}
                  </th>
                  <th className="w-[6.5rem] border-b border-border px-5 py-[11px] pb-2 text-right font-mono text-[0.7rem] font-semibold text-[var(--tenant,var(--primary))] max-[560px]:px-3.5">
                    {tenant.cols[2]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tenant.rows.map(([a, b, c], n) => (
                  <tr
                    key={a}
                    className={cn(animateRows && "landing-row-in")}
                    style={{ animationDelay: `${n * 50}ms` }}
                  >
                    <td className="border-b border-border px-5 py-2.5 last:border-b-0 max-[560px]:px-3.5">
                      {a}
                    </td>
                    <td className="border-b border-border px-5 py-2.5 text-right font-mono tabular-nums last:border-b-0 max-[560px]:px-3.5">
                      {b}
                    </td>
                    <td className="border-b border-border px-5 py-2.5 text-right font-mono font-medium text-[var(--tenant,var(--primary))] last:border-b-0 max-[560px]:px-3.5">
                      {c}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-border bg-muted px-5 py-3.5 max-[560px]:px-3.5">
              <div>
                <div className="text-[0.7rem] font-semibold text-muted-foreground">
                  {tenant.sumK}
                </div>
                <div className="mt-0.5 font-mono text-[1.1rem] font-medium">{tenant.sumV}</div>
              </div>
              <div className="flex items-center gap-[7px] rounded-full border border-border bg-background px-3 py-1.5 text-[0.76rem] font-semibold text-[var(--ok)]">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-[13px]"
                >
                  <path d="M2 8.5l4 4 8-9" />
                </svg>
                {tenant.seal}
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}
