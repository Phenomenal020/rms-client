import { Skeleton } from "@/shadcn/ui/skeleton";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";

export default function Loading(): React.ReactElement {
  return (
    <Tabs defaultValue="school" className="w-full">
      {/* Tabs List */}
      <TabsList className="flex justify-center w-full mx-auto bg-white/60 backdrop-blur-sm rounded-lg p-1 gap-1 mb-8 shadow-sm border border-blue-100/50">
        {/* School Tab Skeleton */}
        <Skeleton className="h-10 w-20 rounded-md" />

        {/* Term Tab Skeleton */}
        <Skeleton className="h-10 w-20 rounded-md" />
      </TabsList>

      {/* Tabs Content - School and Term Forms */}
      <div className="w-full">
        {/* School Tab Content Skeleton - Renders school form */}
        <TabsContent value="school" className="mt-0">
          <Card className="border shadow-md">
            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* School Information Section */}
                <div className="space-y-6">
                  <div className="pb-2 border-b border-gray-200">
                    <Skeleton className="h-7 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                </div>

                {/* Submit Button Skeleton */}
                <div className="pt-6 border-t border-gray-200 mt-6">
                  <div className="flex justify-center">
                    <Skeleton className="h-12 w-40" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Term Tab Content Skeleton - Renders term form */}
        <TabsContent value="term" className="mt-0">
          <Card className="border shadow-md">
            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Term Information Section */}
                <div className="space-y-6">
                  <div className="pb-2 border-b border-gray-200">
                    <Skeleton className="h-7 w-48" />
                  </div>

                  {/* Term and Academic Year Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                  </div>

                  {/* Term Start and End Dates Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                  </div>
                </div>

                {/* Grading System Section Skeleton */}
                <div className="space-y-6">
                  <div className="pb-2 border-b border-gray-200">
                    <Skeleton className="h-7 w-48" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>

                {/* Submit Button Skeleton */}
                <div className="pt-6 border-t border-gray-200 mt-6">
                  <div className="flex justify-center">
                    <Skeleton className="h-12 w-40" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
