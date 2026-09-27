// User is not authenticated and trying to access a protected resource
"use client";

import { Button } from "@/shadcn/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, LogIn, ShieldX } from "lucide-react";

export default function Unauthorized() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span
          className="flex size-14 items-center justify-center rounded-lg border border-border bg-muted/40"
          aria-hidden="true"
        >
          <ShieldX className="size-6" />
        </span>

        {/* Content */}
        <p className="mt-6 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Error 401
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Unauthorized Access
        </h1>
        <p className="mt-3 text-sm text-pretty text-muted-foreground">
          You are not authorized to access this page. Please sign in to continue.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="w-full sm:w-auto cursor-pointer">
            <Link href={`/sign-in?redirect=${pathname}`} className="flex items-center gap-2">
              <LogIn className="size-4" aria-hidden="true" />
              Sign In
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Go Back
          </Button>
        </div>
      </div>
    </main>
  );
}
