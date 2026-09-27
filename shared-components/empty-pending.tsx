import { Button } from "@/shadcn/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shadcn/ui/empty";
import { Inbox, type LucideIcon } from "lucide-react";
import Link from "next/link";

type EmptyPendingProps = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  embedded?: boolean;
};

export function EmptyPending({
  title = "You're all caught up",
  description = "Nothing needs your attention right now. We'll let you know when something comes in.",
  icon: Icon = Inbox,
  actionLabel,
  actionHref,
  onAction,
  embedded = false,
}: EmptyPendingProps) {
  const showAction = Boolean(actionLabel && (actionHref || onAction));

  const content = (
    <div className={embedded ? "w-full" : "w-full max-w-md"}>
      <Empty className={embedded ? "border-0 p-4 md:p-6" : undefined}>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon className="size-4" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          {showAction && (
            <EmptyContent>
              {actionHref ? (
                <Button asChild variant="outline" className="cursor-pointer">
                  <Link href={actionHref}>{actionLabel}</Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={onAction}
                >
                  {actionLabel}
                </Button>
              )}
            </EmptyContent>
          )}
        </Empty>
    </div>
  );

  if (embedded) return content;

  return (
    <section className="flex w-full items-center justify-center bg-background px-6 py-12 text-foreground">
      {content}
    </section>
  );
}
