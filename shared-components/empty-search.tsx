import { Button } from "@/shadcn/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shadcn/ui/empty";
import { RefreshCw, Search } from "lucide-react";

type EmptySearchProps = {
  title?: string;
  description?: string;
  query?: string;
  clearLabel?: string;
  onClear?: () => void;
  embedded?: boolean;
};

export function EmptySearch({
  title = "No results found",
  description,
  query,
  clearLabel = "Clear filters",
  onClear,
  embedded = false,
}: EmptySearchProps) {
  const defaultDescription = query
    ? `We couldn't find anything matching "${query}". Try a different keyword or clear your filters to see all records.`
    : "We couldn't find anything matching your search. Try a different keyword or clear your filters to see all records.";

  const content = (
    <div className={embedded ? "w-full" : "w-full max-w-md rounded-lg border border-border bg-card"}>
      <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-4" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description ?? defaultDescription}</EmptyDescription>
          </EmptyHeader>
          {onClear && (
            <EmptyContent>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={onClear}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {clearLabel}
              </Button>
            </EmptyContent>
          )}
        </Empty>
    </div>
  );

  if (embedded) return content;

  return (
    <section className="flex w-full items-center justify-center bg-muted/30 px-6 py-16 text-foreground">
      {content}
    </section>
  );
}
