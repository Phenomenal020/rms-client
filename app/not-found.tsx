'use client';

import { Button } from "@/shadcn/ui/button";
import Link from "next/link";
import { ArrowLeft, FileQuestion, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  // use router to navigate back to the previous page
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="space-y-8">

          {/* Icon/Illustration */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative flex size-32 items-center justify-center rounded-full bg-primary/10">
                <FileQuestion className="size-16 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Content: 404 Page Not Found */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold tracking-tight text-foreground">
                404
              </h1>
              <h2 className="text-3xl font-semibold text-foreground">
                Page Not Found
              </h2>
            </div>
            <p className="mx-auto max-w-md text-lg text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
              Let&apos;s get you back on track.
            </p>
          </div>

          {/* Action Buttons: Dashboard and Back */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto cursor-pointer">
              <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto bg-white text-black hover:bg-gray-50 cursor-pointer" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

