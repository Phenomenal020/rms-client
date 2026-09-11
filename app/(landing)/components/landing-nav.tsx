"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { navLinks } from "../data/landing-data";
import { BrandLink, BtnPrimary, IconBtn, Shell } from "./landing-ui";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/88 backdrop-blur-[10px]">
      <Shell className="relative flex h-[66px] items-center gap-6">
        <BrandLink />

        <ul
          className={cn(
            "m-0 flex list-none gap-1 p-0 max-[760px]:absolute max-[760px]:left-0 max-[760px]:right-0 max-[760px]:top-[66px] max-[760px]:hidden max-[760px]:flex-col max-[760px]:gap-0 max-[760px]:border-b max-[760px]:border-border max-[760px]:bg-background max-[760px]:px-[clamp(20px,5vw,56px)] max-[760px]:pb-4 max-[760px]:pt-2",
            menuOpen && "max-[760px]:flex"
          )}
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2 text-[0.92rem] font-medium text-muted-foreground no-underline transition-[background,color] hover:bg-muted hover:text-foreground max-[760px]:py-3 max-[760px]:px-0"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <IconBtn
            aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={toggleTheme}
          >
            <svg
              className="size-4 dark:hidden"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            <svg
              className="hidden size-4 dark:block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          </IconBtn>

          <BtnPrimary href="/dashboard" className="px-3.5 py-2 text-[0.88rem] max-[760px]:hidden">
            Get Started
          </BtnPrimary>

          <IconBtn
            className="hidden max-[760px]:grid"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-4"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </IconBtn>
        </div>
      </Shell>
    </header>
  );
}
