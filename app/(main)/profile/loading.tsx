// Loading skeletons for the profile page
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";

// Account section skeleton
export function AccountSectionSkeleton() {
  return (
    <Card className="border shadow-md">
      <CardContent className="pt-4">
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="pb-2 border-b border-border">
              <Skeleton className="h-6 w-48" />
            </div>

            {/* First and Last Name */}
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

            {/* Subsription */}
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

          {/* Verify Email Button */}
          <div className="pt-6 border-t border-border mt-6">
            <div className="flex justify-center gap-3">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Password section skeleton
export function PasswordSectionSkeleton() {
  return (
    <Card className="border shadow-md">
      <CardContent className="pt-4">
        <div className="space-y-6">
          {/* Password section title */}
          <div className="pb-2 border-b border-border">
            <Skeleton className="h-6 w-32" />
          </div>
          {/* Password section content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Preferences section skeleton
export function PreferencesSectionSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border shadow-md">
        <CardContent className="pt-4">
          <div className="space-y-6">
            <div className="pb-2 border-b border-border">
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Overall loading skeleton (on hydration)
export default function Loading() {
  return (
    <div className="w-full space-y-6">
      <AccountSectionSkeleton />
      <PasswordSectionSkeleton />
      <PreferencesSectionSkeleton />
    </div>
  );
}
