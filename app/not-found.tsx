'use client';

import { Button } from "@/shadcn/ui/button";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  // use router to navigate back to the previous page
  const router = useRouter();

  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-background px-6 py-12 text-center text-foreground">
      {/* Content: 404 Page Not Found */}
      <p className="font-mono text-7xl font-bold tracking-tighter sm:text-8xl">
        404
      </p>

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Page Not Found
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
      </div>

      {/* Action Buttons: Dashboard and Back */}
      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <Button asChild className="w-full sm:w-auto cursor-pointer">
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Dashboard
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
      </div>
    </main>
  );
}
