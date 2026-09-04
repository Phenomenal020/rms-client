// User is authenticated but not authorised to access this resource
import { Button } from "@/shadcn/ui/button";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function Forbidden() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span
          className="flex size-14 items-center justify-center rounded-lg border border-border bg-muted/40"
          aria-hidden="true"
        >
          <Lock className="size-6" />
        </span>

        {/* Content */}
        <p className="mt-6 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Error 403
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Access denied
        </h1>
        <p className="mt-3 text-sm text-pretty text-muted-foreground">
          You don&apos;t have permission to view this page. If you think this is
          a mistake, ask your admin to grant you access.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="w-full sm:w-auto cursor-pointer">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto cursor-pointer">
            <Link href="/settings/profile">Go to Profile</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
