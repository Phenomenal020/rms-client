"use client";

import Image from "next/image";
import { useState } from "react";

// Manual before/after slider
export function BeforeAfter({ start = 50 }: { start?: number }) {
  // state for the position of the slider (50% is halfway)
  const [pos, setPos] = useState(start);

  return (
    <div className="group relative aspect-[2/1] lg:aspect-[5/4] w-full min-w-0 overflow-hidden rounded-[28px] shadow-2xl">
      {/* After image */}
      <Image
        src="/banner-image-after.png"
        alt="With AiD: teacher smiling, holding an AiD report card"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover"
      />
      {/* Before image */}
      <Image
        src="/banner-image-before.png"
        alt="Before AiD: teacher buried in score sheets with a calculator"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover grayscale contrast-105"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      // clip: top(0) right9100 - pos) bottom(0) left(0)
      />

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Drag to compare before and after AiD"
        className="peer absolute inset-0 z-30 h-full w-full cursor-ew-resize appearance-none opacity-0"
      />

      {/* Slider handle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 z-20 -ml-[1.5px] w-[3px] bg-white shadow [&>span]:peer-focus-visible:ring-4 [&>span]:peer-focus-visible:ring-blue-600"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-900 shadow-lg">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </span>
      </div>
    </div>
  );
}
