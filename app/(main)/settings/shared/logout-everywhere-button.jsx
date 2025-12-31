"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { authClient } from "@/src/lib/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutEverywhereButton() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogoutEverywhere() {
    setLoading(true);
    const { error } = await authClient.revokeSessions();
    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to log out everywhere");
    } else {
      toast.success("Logged out from all devices");
      router.push("/sign-in");
    }
  }

  return (
    <Card className="border shadow-md border-red-200 bg-red-50/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
            <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              Session Management
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Log out from all devices and browsers
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This will immediately log you out from all devices where you&apos;re currently signed in. You&apos;ll need to sign in again on all devices.
        </p>
        <LoadingButton
          variant="destructive"
          onClick={handleLogoutEverywhere}
          loading={loading}
          className="w-full h-10 font-medium shadow-sm hover:shadow transition-shadow"
        >
          Log Out Everywhere
        </LoadingButton>
      </CardContent>
    </Card>
  );
}
