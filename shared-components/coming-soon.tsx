import { Button } from "@/shadcn/ui/button";
import Link from "next/link";
import { ArrowLeft, Clock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ComingSoonVariant = "default" | "info";

type ComingSoonProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  backHref?: string;
  backLabel?: string;
  variant?: ComingSoonVariant;
};

export function ComingSoon({
  title,
  description = "We're working on this feature and it'll be available in a future update. Check back soon.",
  icon: Icon = Clock,
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
  variant = "default",
}: ComingSoonProps) {
  const isInfo = variant === "info";

  return (
    <section className="flex min-h-[calc(100svh-4rem)] w-full items-center justify-center px-6 py-16 text-foreground">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-lg border",
            isInfo
              ? "border-blue-500/30 bg-blue-500/10"
              : "border-border bg-muted/40",
          )}
          aria-hidden="true"
        >
          <Icon
            className="size-6 text-foreground"
          />
        </span>

        <p
          className="mt-6 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
        >
          Coming soon
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p
          className={cn(
            "mt-3 text-sm text-pretty",
            isInfo
              ? "rounded-lg border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-left dark:text-blue-200"
              : "text-muted-foreground",
          )}
        >
          {description}
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="w-full sm:w-auto cursor-pointer">
            <Link href={backHref} className="flex items-center gap-2">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {backLabel}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
