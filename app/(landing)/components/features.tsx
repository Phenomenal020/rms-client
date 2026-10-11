"use client";

import { useState } from "react";
import { pipelineStages } from "../data/landing-data";
import { SectionHead, Shell } from "./landing-ui";
import { PipelineStageMockKey, StageMock } from "./stage-mocks";
import { cn } from "@/lib/utils";

export function Features() {
  const [activeStage, setActiveStage] = useState(0);
  const stage = pipelineStages[activeStage];

  return (
    <section id="about" className="border-y border-border bg-muted py-[clamp(56px,7vw,104px)]">
      <Shell>
        <SectionHead
          title="The pipeline in a nutshell..."
          description="School Admin sets up the school including classes, teachers, students,  grading system and assessment structure. Form Teacher manages results for their class, and subject teachers manage results for their subjects. Everything gets logged and audited to ensure compliance. Separation of concerns. No paper trail needed."
        />

        <div
          className="mt-9 flex overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Stages of the results pipeline"
        >
          {pipelineStages.map((s, i) => (
            <button
              key={s.mockKey}
              type="button"
              role="tab"
              id={`s${i}`}
              aria-selected={activeStage === i}
              aria-controls="stagePanel"
              onClick={() => setActiveStage(i)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const next =
                  (i + (e.key === "ArrowRight" ? 1 : pipelineStages.length - 1)) %
                  pipelineStages.length;
                setActiveStage(next);
                document.getElementById(`s${next}`)?.focus();
              }}
              className="group min-w-[152px] flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
            >
              <span className="mb-3 flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-[30px] shrink-0 place-items-center rounded-full border border-border bg-background font-mono text-[0.78rem] font-medium text-muted-foreground transition-[background,border-color,color,box-shadow] duration-200",
                    activeStage === i &&
                    "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_var(--accent)]",
                    i < activeStage &&
                    "border-accent bg-accent text-accent-foreground"
                  )}
                >
                  {i + 1}
                </span>
                {i < pipelineStages.length - 1 && (
                  <span className="h-px flex-1 bg-border" />
                )}
              </span>

              <span
                className={cn(
                  "block pr-4 text-[0.95rem] font-semibold text-muted-foreground transition-colors group-hover:text-foreground",
                  activeStage === i && "text-foreground"
                )}
              >
                {["Setup", "Grading", "Enrollment", "Output", "Release"][i]}
              </span>
            </button>
          ))}
        </div>

        <div
          id="stagePanel"
          role="tabpanel"
          aria-labelledby={`s${activeStage}`}
          tabIndex={0}
          className="mt-7 grid items-center gap-[clamp(24px,4vw,48px)] rounded-[calc(var(--radius)+10px)] border border-border bg-card p-[clamp(22px,3vw,38px)] shadow-sm lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
        >
          <div>
            <h3 className="mb-3 text-[clamp(1.25rem,2vw,1.6rem)] font-bold tracking-[-0.02em] leading-[1.12]">
              {stage.title}
            </h3>
            <p className="text-muted-foreground">{stage.body}</p>
            <ul className="mt-5 grid list-none gap-2 p-0">
              {stage.pts.map((pt) => (
                <li key={pt} className="flex items-start gap-2 text-[0.92rem]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-1 size-4 shrink-0 text-primary"
                  >
                    <path d="M4 12.5l5 5 11-11" />
                  </svg>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex min-h-[270px] flex-col justify-center rounded-xl border border-border bg-muted p-[18px]">
            <StageMock mockKey={stage.mockKey as PipelineStageMockKey} />
          </div>
        </div>
      </Shell>
    </section>
  );
}