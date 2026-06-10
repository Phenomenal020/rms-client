import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";

const labelClassName = "text-sm md:text-base text-muted-foreground font-semibold";

// In-component card skeleton — labels shown; only inputs skeletonised
export function SchoolFormCardSkeleton(): React.ReactElement {
  return (
    <Card className="border shadow-md">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* School Information Section */}
          <section className="space-y-4">
            <div className="space-y-2">
              <p className={labelClassName}>
                School Name<span className="text-destructive text-base">*</span>
              </p>
              <Skeleton className="h-6 w-full" />
            </div>

            <div className="space-y-2">
              <p className={labelClassName}>Address</p>
              <Skeleton className="h-6 w-full" />
            </div>

            <div className="space-y-2">
              <p className={labelClassName}>Motto</p>
              <Skeleton className="min-h-6 md:min-h-8 w-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className={labelClassName}>Telephone</p>
                <Skeleton className="h-6 w-full" />
              </div>
              <div className="space-y-2">
                <p className={labelClassName}>Email</p>
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </section>

          {/* Registration ID section — label + helper text shown; input skeletonised */}
          <section className="space-y-2 pt-4 border-t border-border">
            <div>
              <p className={labelClassName}>School Registration ID</p>
            </div>
            <Skeleton className="h-6 w-full" />
          </section>

          {/* Submit / Discard Buttons */}
          <div className="pt-4 border-t border-border mt-4">
            <div className="flex justify-center gap-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Route-level + OrgAdminGate fallback — wrap in the same shell as page.tsx
export default function SchoolLoading(): React.ReactElement {
  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <div className="space-y-6">
          {/* Page Header */}
          <section className="space-y-2">
            <Skeleton className="h-6 w-64" />
          </section>

          {/* school form (would be reused for post-hydration loading) */}
          <SchoolFormCardSkeleton />
        </div>
      </div>
    </main>
  );
}
