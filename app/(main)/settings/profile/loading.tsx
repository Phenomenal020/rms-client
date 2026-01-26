// Loading skeleton for the profile page
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

        {/* Tabs Skeleton */}
        <div className="w-full mb-8">
          <div className="flex justify-center gap-0">
            <Skeleton className="h-10 w-24 mx-2" />
            <Skeleton className="h-10 w-24 mx-2" />
            <Skeleton className="h-10 w-24 mx-2" />
          </div>
        </div>

        {/* Form Card Skeleton */}
        <Card className="border shadow-md">
          <CardContent className="pt-4">
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="pb-2 border-b border-gray-200">
                  <Skeleton className="h-6 w-48" />
                </div>

                {/* Profile Image Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Skeleton className="size-24 rounded-full" />
                  <div className="flex-1 w-full space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>

                {/* First Name and Last Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                {/* Subscription and Role Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
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

