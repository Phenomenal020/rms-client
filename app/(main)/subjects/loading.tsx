import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";

export default function Loading() {
  return (
    <div className="w-full">
      {/* Tab Buttons Skeleton */}
      <div className="flex flex-wrap justify-start gap-2 mb-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Tab Content Skeleton */}
      <div className="w-full">
        <Card className="border shadow-md">
          <CardContent className="pt-4">
            <div className="space-y-6">
              {/* Subjects Form Skeleton */}
              <div className="space-y-6">
                <div className="pb-2 border-b border-border">
                  <Skeleton className="h-6 w-40" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-40" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Skeleton className="h-5 w-48" />
                      <div className="ml-auto flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button Skeleton */}
              <div className="pt-6 border-t border-border mt-6">
                <div className="flex justify-center">
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

