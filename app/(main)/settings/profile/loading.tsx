// Loading skeleton for the profile page
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { Card, CardContent } from "@/shadcn/ui/card";

export default function Loading() {
  return (
    <Tabs defaultValue="account" className="w-full">
      {/* Tabs List */}
      <TabsList className="flex justify-center w-full mx-auto bg-card/60 backdrop-blur-sm rounded-lg p-1 gap-1 mb-8 shadow-sm border border-border/50">
        {/* Account Tab Skeleton */}
        <Skeleton className="h-10 w-20 rounded-md" />

        {/* Email Tab Skeleton */}
        <Skeleton className="h-10 w-20 rounded-md" />

        {/* Password Tab Skeleton */}
        <Skeleton className="h-10 w-24 rounded-md" />

        {/* Sessions Tab Skeleton */}
        <Skeleton className="h-10 w-24 rounded-md" />

        {/* Settings Tab Skeleton */}
        <Skeleton className="h-10 w-24 rounded-md" />
      </TabsList>

      {/* Tabs Content */}
      <div className="w-full">
        {/* Account Tab Content Skeleton - Renders basic user information */}
        <TabsContent value="account" className="mt-0 space-y-6">
          <Card className="border shadow-md">
            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="pb-2 border-b border-border">
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
                <div className="pt-6 border-t border-border mt-6">
                  <div className="flex justify-center">
                    <Skeleton className="h-10 w-40" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab Content Skeleton - Renders email change form */}
        <TabsContent value="email" className="mt-0">
          <Card className="border shadow-md">
            <CardContent className="pt-4">
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab Content Skeleton - Renders password change form */}
        <TabsContent value="password" className="mt-0">
          <Card className="border shadow-md">
            <CardContent className="pt-4">
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab Content Skeleton - Renders user sessions */}
        <TabsContent value="sessions" className="mt-0">
          <Card className="border shadow-md">
            <CardContent className="pt-4">
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab Content Skeleton - Renders settings form */}
        <TabsContent value="settings" className="mt-0">
          <Card className="border shadow-md">
            <CardContent className="pt-4">
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}

