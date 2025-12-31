"use client";

import { Button } from "@/shadcn/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldX, LogIn } from "lucide-react";

export default function Unauthorized() {
  const pathname = usePathname();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="space-y-8">
          {/* Icon/Illustration */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-3xl" />
              <div className="relative flex size-32 items-center justify-center rounded-full bg-red-500/10">
                <ShieldX className="size-16 text-red-600 dark:text-red-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold tracking-tight text-foreground">
                401
              </h1>
              <h2 className="text-3xl font-semibold text-foreground">
                Unauthorized Access
              </h2>
            </div>
            <p className="mx-auto max-w-md text-lg text-muted-foreground">
              You are not authorized to access this page. Please sign in to continue.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto cursor-pointer">
              <Link href={`/sign-in?redirect=${pathname}`} className="flex items-center gap-2">
                <LogIn className="size-4" />
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
