"use client";

import { useEffect, startTransition } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsError({ error, reset }: { error: Error, reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    // Log error to error reporting service
    console.error("Settings error:", error);
  }, [error]);

  const handleReload = () => {
    // Reset the error boundary first to clear the error state
    reset();
    // Using startTransition to mark this as a non-urgent update
    startTransition(() => {
      router.refresh();  // Causes the server components to refetch their data and re-render.
    });
  };

  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">
      <div className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-2">
            Settings Error
          </h1>
        </div>

        {/* Error Card */}
        <Card className="border shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              {/* Error Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Something went wrong!
                </h2>
                <p className="text-base text-muted-foreground max-w-md">
                  {error?.message || "An unexpected error occurred while loading the settings page."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {/* Reset */}
                <Button 
                  onClick={handleReload}
                  className="min-w-[160px] h-10 font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                >
                  <RotateCcw className="size-4 mr-2" />
                  Try Again
                </Button>
                {/* Go to Dashboard */}
                <Button 
                  variant="outline"
                  onClick={() => router.back()}
                  className="min-w-[160px] h-10 font-medium cursor-pointer"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
