import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shadcn/ui/empty";

type ErrorBannerProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
};

export function ErrorBanner({
  message,
  title = "Something went wrong",
  onRetry,
}: ErrorBannerProps) {
  return (
    <div className="w-full rounded-lg border border-border bg-card">
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="bg-destructive/10 text-destructive"
          >
            <AlertCircle className="size-4" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{message}</EmptyDescription>
        </EmptyHeader>
        {onRetry && (
          <EmptyContent>
            <Button
              type="button"
              size="sm"
              className="cursor-pointer"
              onClick={onRetry}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </EmptyContent>
        )}
      </Empty>
    </div>
  );
}
