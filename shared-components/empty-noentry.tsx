import { Button } from "@/shadcn/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shadcn/ui/empty";
import { CirclePlus, type LucideIcon } from "lucide-react";
import Link from "next/link";

type EmptyNoEntryProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  embedded?: boolean;
};

export function EmptyNoEntry({
  title,
  description,
  icon: Icon = CirclePlus,
  actionLabel,
  actionHref,
  onAction,
  embedded = false,
}: EmptyNoEntryProps) {
  const showAction = Boolean(actionLabel && (actionHref || onAction));

  const content = (
    <div className={embedded ? "w-full" : "w-full max-w-md"}>
      <Empty
        className={
          embedded
            ? "border-muted-foreground/25 bg-muted/20 border-0 p-4 md:p-6"
            : "border-muted-foreground/25 bg-muted/20"
        }
      >
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
                <Button asChild className="cursor-pointer">
                  <Link href={actionHref}>
                    <Icon className="size-4" aria-hidden="true" />
                    {actionLabel}
                  </Link>
                </Button>
              ) : (
                <Button type="button" className="cursor-pointer" onClick={onAction}>
                  <Icon className="size-4" aria-hidden="true" />
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
