import Link from "next/link";
import { cn } from "@/lib/utils";

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

// export function Eyebrow({ children }: { children: React.ReactNode }) {
//   return (
//     <span className="mb-[18px] inline-flex items-center gap-[7px] rounded-full bg-accent px-3 py-[5px] text-[0.8rem] font-semibold text-accent-foreground">
//       <i className="block size-[6px] rounded-full bg-primary" />
//       {children}
//     </span>
//   );
// }

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={cn("size-7 shrink-0 rounded-md", className)} viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="6" className="fill-primary" />
      <path
        d="M7 10h14M7 14h14M7 18h8"
        className="stroke-primary-foreground"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="19.5" cy="18" r="2.4" className="fill-primary-foreground opacity-55" />
    </svg>
  );
}

export function BrandLink({ className }: { className?: string }) {
  return (
    <Link
      href="#top"
      className={cn(
        "mr-auto flex items-center gap-2.5 text-[1.15rem] font-extrabold tracking-[-0.03em] no-underline",
        className
      )}
    >
      <BrandMark />
      AiD
    </Link>
  );
}

const btnBase =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-transparent px-5 py-[11px] text-[0.94rem] font-semibold no-underline transition-[background,border-color,color] duration-150";

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

export function SectionHead({
  // eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-[58ch]">
      {/* <Eyebrow>To be Removed</Eyebrow> */}
      <h2 className="text-[clamp(1.7rem,3.2vw,2.5rem)] font-bold tracking-[-0.02em] leading-[1.12]">
        {title}
      </h2>
      {description && (
        <p className="mt-3.5 text-[1.05rem] text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

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
