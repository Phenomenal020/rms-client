import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/shadcn/ui/button";

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
        <div className="w-full rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
                    <AlertCircle className="size-7 text-destructive" strokeWidth={1.5} />
                </div>

                <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="max-w-md text-sm text-muted-foreground">{message}</p>
                </div>

                {onRetry && (
                    <Button
                        type="button"
                        size="sm"
                        onClick={onRetry}
                        className="cursor-pointer shadow-sm hover:shadow"
                    >
                        <RotateCcw className="size-4" />
                        Try again
                    </Button>
                )}
            </div>
        </div>
    );
}
