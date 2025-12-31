// Loading skeleton for the term page
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";

export default function Loading() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">
      <div className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Header Section Skeleton */}
        <div className="text-center mb-10 sm:mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Form Card Skeleton */}
        <Card className="border shadow-md">
          <CardContent className="pt-4">
            <div className="space-y-6">
              {/* Term Information Section */}
              <div className="space-y-6">
                <div className="pb-2 border-b border-gray-200">
                  <Skeleton className="h-6 w-48" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              {/* Grading System Section */}
              <div className="space-y-5 mt-8 pt-8 border-t border-gray-200">
                <div className="pb-2 border-b border-gray-200">
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-4 w-96" />
                <div className="grid grid-cols-12 gap-2">
                  <Skeleton className="col-span-3 h-10" />
                  <Skeleton className="col-span-3 h-10" />
                  <Skeleton className="col-span-3 h-10" />
                  <Skeleton className="col-span-3 h-10" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>

              {/* Result Template Section */}
              <div className="space-y-4 mt-8 pt-8 border-t border-gray-200">
                <div className="pb-2 border-b border-gray-200">
                  <Skeleton className="h-6 w-56" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-80" />
                </div>
              </div>

              {/* Submit Button Skeleton */}
              <div className="pt-6 border-t border-gray-200 mt-6">
                <div className="flex justify-center">
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

