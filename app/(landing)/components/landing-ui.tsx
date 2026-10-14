// Wrapper shared components for the landing page

import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Container for each section of the landing page
export function Shell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[1200px] px-[clamp(20px,5vw,56px)]",
        className
      )}
    >
      {children}
    </div>
  );
}

// Compact logo for navbar
const COMPACT_LOGO = {
  light: "/aid-logo-compact-light.svg",
  dark: "/aid-logo-compact-dark.svg",
  width: 102,
  height: 44,
} as const;

// Full logo for footer and emails
const FULL_LOGO = {
  light: "/aid-logo-light.svg",
  dark: "/aid-logo-dark.svg",
  width: 323,
  height: 88,
} as const;

// Navbar (Compact logo with "AiD" text) 
export function BrandMark({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  const imgClass = cn("h-7 w-auto md:h-8", className);

  return (
    <>
      <Image
        src={COMPACT_LOGO.light}
        alt="AiD logo"
        width={COMPACT_LOGO.width}
        height={COMPACT_LOGO.height}
        priority={priority}
        className={cn(imgClass, "dark:hidden")}
      />
      <Image
        src={COMPACT_LOGO.dark}
        alt="AiD logo"
        width={COMPACT_LOGO.width}
        height={COMPACT_LOGO.height}
        priority={priority}
        className={cn(imgClass, "hidden dark:block")}
      />
    </>
  );
}

// Footer (Full logo with "Result management" text)
export function BrandLogoFull({
  className
}: {
  className?: string;
}) {
  const imgClass = cn("h-10 w-auto md:h-12", className);

  return (
    <>
      <Link href="#top">
        <Image
          src={FULL_LOGO.light}
          alt="AiD — Result management"
          width={FULL_LOGO.width}
          height={FULL_LOGO.height}
          className={cn(imgClass, "dark:hidden")}
        />
        <Image
          src={FULL_LOGO.dark}
          alt="AiD — Result management"
          width={FULL_LOGO.width}
          height={FULL_LOGO.height}
          className={cn(imgClass, "hidden dark:block")}
        />
      </Link>
    </>
  );
}

// Navbar link (Compact logo)
export function BrandLink({ className }: { className?: string }) {
  return (
    <Link
      href="#top"
      className={cn("mr-auto inline-flex items-center no-underline", className)}
      aria-label="AiD home"
    >
      <BrandMark priority />
    </Link>
  );
}

// Button base styles
const btnBase =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-transparent px-5 py-[11px] text-[0.94rem] font-semibold no-underline transition-[background,border-color,color] duration-150";

// Primary button
export function BtnPrimary({
  children,
  className,
  href,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  const classes = cn(
    btnBase,
    "bg-primary text-primary-foreground shadow-xs hover:bg-chart-2",
    className
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}

// Ghost button
export function BtnGhost({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        btnBase,
        "border-border bg-background text-foreground hover:border-muted-foreground hover:bg-muted",
        className
      )}
    >
      {children}
    </Link>
  );
}

// Icon button
export function IconBtn({
  children,
  className,
  onClick,
  "aria-label": ariaLabel,
  "aria-expanded": ariaExpanded,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      className={cn(
        "grid size-9 place-items-center rounded-lg border border-border bg-background transition-colors hover:bg-muted",
        className
      )}
    >
      {children}
    </button>
  );
}

// Section header
export function SectionHead({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      {/* <Eyebrow>To be Removed</Eyebrow> */}
      <h2 className="text-[clamp(1.5rem,3.2vw,2.25rem)] font-bold tracking-[-0.02em] leading-[1.2] text-left max-w-[776px]">
        {title}
      </h2>
      {description && (
        <p className="mt-3.5 text-[1rem] text-muted-foreground text-left max-w-[776px]">{description}</p>
      )}
    </div>
  );
}

// Check icon
export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4 shrink-0 text-primary", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}