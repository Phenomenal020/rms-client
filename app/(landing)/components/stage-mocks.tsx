"use client";

import { useState } from "react";

function MockBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 font-mono text-[0.72rem] text-muted-foreground">
      {children}
    </div>
  );
}

export function EntryMock() {
  return (
    <>
      <MockBar>
        <b className="block size-[7px] rounded-full bg-[var(--ok)]" />
        Saved 2 seconds ago · Y11 Physics
      </MockBar>
      <div className="overflow-hidden rounded-lg border border-border bg-card text-[0.84rem]">
        <div className="grid grid-cols-[1fr_70px_70px] items-center border-b border-border bg-muted text-[0.7rem] font-semibold text-muted-foreground">
          <span className="px-3 py-2">Student</span>
          <span className="border-l border-border px-3 py-2 text-right font-mono">Test</span>
          <span className="border-l border-border px-3 py-2 text-right font-mono">Exam</span>
        </div>
        {[
          ["Bello, Amara", "38", "84", false],
          ["Chen, Wei", "35", "71", false],
          ["Duarte, Luis", "40", "104", true],
          ["Effiong, Ada", "33", "66", false],
        ].map(([name, test, exam, warn]) => (
          <div
            key={name as string}
            className="grid grid-cols-[1fr_70px_70px] items-center border-b border-border last:border-b-0"
          >
            <span className="px-3 py-2">{name}</span>
            <span className="border-l border-border px-3 py-2 text-right font-mono">{test}</span>
            <span
              className={`border-l border-border px-3 py-2 text-right font-mono ${
                warn
                  ? "bg-destructive/8 font-medium text-destructive"
                  : "text-[var(--ok)]"
              }`}
            >
              {exam}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/8 px-[11px] py-2 text-[0.8rem] text-destructive">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-3.5 shrink-0">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        104 is above the maximum of 100 for this paper.
      </div>
    </>
  );
}

const GRADE_BANDS: [number, string][] = [
  [80, "A*"],
  [70, "A"],
  [60, "B"],
  [50, "C"],
  [40, "D"],
  [0, "E"],
];

export function GradingMock() {
  const [courseworkWeight, setCourseworkWeight] = useState(40);
  const [courseworkMark, setCourseworkMark] = useState(76);
  const [examMark, setExamMark] = useState(88);

  const finalMark =
    (courseworkMark * courseworkWeight + examMark * (100 - courseworkWeight)) / 100;
  const grade = GRADE_BANDS.find(([min]) => finalMark >= min)?.[1] ?? "E";
  const markPosition = Math.min(99.5, Math.max(0.5, finalMark));

  return (
    <>
      <MockBar>Grading rule · Kestrel Grammar · KS4</MockBar>
      <div className="mb-1 flex items-center justify-between gap-3 text-[0.84rem]">
        <span>Coursework / exam split</span>
        <span className="font-mono text-[0.8rem] text-muted-foreground">
          {courseworkWeight}% / {100 - courseworkWeight}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={courseworkWeight}
        onChange={(e) => setCourseworkWeight(+e.target.value)}
        aria-label="Coursework weight"
        className="landing-range mb-3 w-full"
      />
      <div className="mb-1 flex items-center justify-between gap-3 text-[0.84rem]">
        <span>Coursework mark</span>
        <span className="font-mono text-[0.8rem] text-muted-foreground">{courseworkMark}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={courseworkMark}
        onChange={(e) => setCourseworkMark(+e.target.value)}
        aria-label="Coursework mark"
        className="landing-range mb-3 w-full"
      />
      <div className="mb-1 flex items-center justify-between gap-3 text-[0.84rem]">
        <span>Exam mark</span>
        <span className="font-mono text-[0.8rem] text-muted-foreground">{examMark}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={examMark}
        onChange={(e) => setExamMark(+e.target.value)}
        aria-label="Exam mark"
        className="landing-range mb-3 w-full"
      />
      <div className="mt-1 flex items-end justify-between gap-3.5 rounded-lg border border-border bg-card px-4 py-3">
        <div>
          <div className="text-[0.7rem] font-semibold text-muted-foreground">Final mark</div>
          <div className="font-mono text-[1.6rem] font-medium leading-none">
            {finalMark.toFixed(1)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[0.7rem] font-semibold text-muted-foreground">Grade</div>
          <div className="text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-primary">
            {grade}
          </div>
        </div>
      </div>
      <div className="mt-3.5 flex h-2 overflow-hidden rounded-full bg-border">
        <span className="flex-1 border-r-2 border-muted bg-chart-5" />
        <span className="flex-1 border-r-2 border-muted bg-chart-4" />
        <span className="flex-1 border-r-2 border-muted bg-chart-3" />
        <span className="flex-1 border-r-2 border-muted bg-chart-2" />
        <span className="flex-1 border-r-2 border-muted bg-chart-1" />
        <span className="flex-1 bg-accent" />
      </div>
      <div className="relative mt-[3px] h-3">
        <i
          className="absolute top-0 h-[9px] w-0.5 -translate-x-1/2 bg-foreground transition-[left] duration-[180ms] ease-out"
          style={{ left: `${markPosition}%` }}
        />
      </div>
      <div className="flex font-mono text-[0.66rem] text-muted-foreground">
        {["E", "D", "C", "B", "A", "A*"].map((g) => (
          <span key={g} className="flex-1 text-center">
            {g}
          </span>
        ))}
      </div>
    </>
  );
}

function ChainDot({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span
      className={`z-[1] grid size-[26px] place-items-center rounded-full border border-border bg-card ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

export function ApprovalMock() {
  const items = [
    { name: "R. Adeyemi", role: "Subject teacher", when: "4 Jun", status: "ok" as const },
    { name: "J. Okonkwo", role: "Head of science", when: "5 Jun", status: "ok" as const },
    { name: "A. Nwosu", role: "Exam officer", when: "waiting 2 days", status: "now" as const },
    { name: "Dr S. Whitfield", role: "Head teacher", when: "pending", status: "pending" as const },
  ];

  return (
    <>
      <MockBar>Y11 Physics · Summer 2026 · awaiting 1 signature</MockBar>
      <div className="grid">
        {items.map((item, i) => (
          <div
            key={item.name}
            className={`relative grid grid-cols-[26px_1fr_auto] items-start gap-3 pb-4 ${
              i < items.length - 1
                ? "after:absolute after:bottom-0 after:left-[12.5px] after:top-[26px] after:w-px after:bg-border"
                : ""
            }`}
          >
            {item.status === "ok" ? (
              <ChainDot className="border-[var(--ok)] bg-[var(--ok)] text-white">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="size-[13px]">
                  <path d="M2.5 8.5l4 4 7-8" />
                </svg>
              </ChainDot>
            ) : item.status === "now" ? (
              <ChainDot className="border-primary bg-primary text-white shadow-[0_0_0_4px_var(--accent)]">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="size-[13px]">
                  <circle cx="8" cy="8" r="5.2" />
                  <path d="M8 5.4V8l1.8 1.2" />
                </svg>
              </ChainDot>
            ) : (
              <ChainDot />
            )}
            <span>
              <span className="block text-[0.88rem] font-semibold leading-snug">{item.name}</span>
              <span className="block text-[0.78rem] text-muted-foreground">{item.role}</span>
            </span>
            <span
              className={`whitespace-nowrap font-mono text-[0.72rem] text-muted-foreground ${
                item.status === "now" ? "text-primary" : ""
              }`}
            >
              {item.when}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export function OutputMock() {
  return (
    <>
      <MockBar>transcript_44-92018.pdf · A4 · generated in 1.2s</MockBar>
      <div className="flex items-stretch gap-4 max-[760px]:flex-col">
        <div className="flex-1 rounded-lg border border-border bg-card p-4">
          <div className="mb-2.5 size-[26px] rounded-sm bg-primary" />
          <div className="mb-[7px] h-1.5 w-[70%] rounded-full bg-border" />
          <div className="mb-[7px] h-1.5 w-[45%] rounded-full bg-border opacity-60" />
          <div className="mb-[7px] mt-3.5 h-1.5 w-full rounded-full bg-border" />
          <div className="mb-[7px] h-1.5 w-[92%] rounded-full bg-border" />
          <div className="mb-[7px] h-1.5 w-[96%] rounded-full bg-border" />
          <div className="mb-[7px] h-1.5 w-[60%] rounded-full bg-border" />
          <div className="mb-[7px] mt-3.5 h-1.5 w-[38%] rounded-full bg-border opacity-60" />
        </div>
        <div className="flex w-[110px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 text-center max-[760px]:w-full">
          <svg className="size-[66px]" viewBox="0 0 21 21" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="0" y="0" width="7" height="7" fill="none" stroke="currentColor" className="text-foreground" />
            <rect x="2" y="2" width="3" height="3" className="fill-foreground" />
            <rect x="14" y="0" width="7" height="7" fill="none" stroke="currentColor" className="text-foreground" />
            <rect x="16" y="2" width="3" height="3" className="fill-foreground" />
            <rect x="0" y="14" width="7" height="7" fill="none" stroke="currentColor" className="text-foreground" />
            <rect x="2" y="16" width="3" height="3" className="fill-foreground" />
            <rect x="9" y="1" width="1" height="1" className="fill-foreground" />
            <rect x="11" y="1" width="1" height="1" className="fill-foreground" />
            <rect x="9" y="3" width="2" height="1" className="fill-foreground" />
            <rect x="12" y="4" width="1" height="2" className="fill-foreground" />
            <rect x="9" y="6" width="1" height="2" className="fill-foreground" />
            <rect x="1" y="9" width="2" height="1" className="fill-foreground" />
            <rect x="4" y="9" width="1" height="2" className="fill-foreground" />
            <rect x="6" y="10" width="2" height="1" className="fill-foreground" />
            <rect x="9" y="9" width="2" height="2" className="fill-foreground" />
            <rect x="12" y="9" width="1" height="1" className="fill-foreground" />
            <rect x="14" y="9" width="2" height="1" className="fill-foreground" />
            <rect x="17" y="10" width="1" height="2" className="fill-foreground" />
            <rect x="19" y="9" width="1" height="1" className="fill-foreground" />
            <rect x="10" y="12" width="1" height="2" className="fill-foreground" />
            <rect x="13" y="12" width="2" height="1" className="fill-foreground" />
            <rect x="16" y="13" width="1" height="1" className="fill-foreground" />
            <rect x="19" y="12" width="1" height="2" className="fill-foreground" />
            <rect x="9" y="15" width="1" height="1" className="fill-foreground" />
            <rect x="11" y="16" width="2" height="1" className="fill-foreground" />
            <rect x="15" y="16" width="1" height="2" className="fill-foreground" />
            <rect x="18" y="17" width="2" height="1" className="fill-foreground" />
            <rect x="10" y="19" width="1" height="1" className="fill-foreground" />
            <rect x="13" y="19" width="2" height="1" className="fill-foreground" />
            <rect x="17" y="19" width="1" height="1" className="fill-foreground" />
          </svg>
          <span className="break-all text-[0.66rem] font-semibold leading-snug text-[var(--ok)]">
            Verified
            <br />
            tabula.school/v/8f2a
          </span>
        </div>
      </div>
    </>
  );
}

export function ReleaseMock() {
  return (
    <>
      <MockBar>Release schedule · Summer 2026</MockBar>
      <div className="flex items-center gap-4 max-[760px]:flex-col">
        <div className="w-[150px] shrink-0 rounded-[calc(var(--radius)+10px)] border border-border bg-card p-3 shadow-sm max-[760px]:w-full">
          <div className="mx-auto mb-3 h-1 w-[38px] rounded-full bg-border" />
          {[
            ["Mathematics", "A*"],
            ["Physics", "A"],
            ["History", "B"],
          ].map(([sub, grade]) => (
            <div
              key={sub}
              className="mb-2 flex items-center justify-between rounded-lg border border-border px-2.5 py-2 last:mb-0"
            >
              <span className="text-[0.74rem] font-semibold">{sub}</span>
              <span className="font-mono text-[0.74rem] text-primary">{grade}</span>
            </div>
          ))}
        </div>
        <div className="grid flex-1 gap-2.5">
          {[
            { year: "Year 11", when: "Fri 12 Jun, 09:00", status: "live" as const },
            { year: "Year 12", when: "Fri 12 Jun, 11:00", status: "wait" as const },
            { year: "Year 13", when: "Mon 15 Jun, 09:00", status: "wait" as const },
          ].map((r) => (
            <div
              key={r.year}
              className="flex items-center justify-between gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-[0.82rem]"
            >
              <span>
                <b>{r.year}</b>
                <br />
                <span className="font-mono text-[0.72rem] text-muted-foreground">{r.when}</span>
              </span>
              <span
                className={`whitespace-nowrap rounded-full px-2 py-[3px] text-[0.68rem] font-semibold ${
                  r.status === "live"
                    ? "bg-[color-mix(in_oklab,var(--ok)_15%,transparent)] text-[var(--ok)]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {r.status === "live" ? "Released" : "Scheduled"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function StageMock({ mockKey }: { mockKey: PipelineStageMockKey }) {
  switch (mockKey) {
    case "entry":
      return <EntryMock />;
    case "grading":
      return <GradingMock />;
    case "approval":
      return <ApprovalMock />;
    case "output":
      return <OutputMock />;
    case "release":
      return <ReleaseMock />;
  }
}

export type PipelineStageMockKey = "entry" | "grading" | "approval" | "output" | "release";
