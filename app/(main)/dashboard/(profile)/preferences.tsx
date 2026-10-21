"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shadcn/ui/button";
import { Switch } from "@/shadcn/ui/switch";
import { Card, CardContent } from "@/shadcn/ui/card";
import { toast } from "sonner";


export function Preferences() {

  // state for the notifications. TODO: Add these to the User model
  const [notifications, setNotifications] = useState({
    loginNotifications: true,
    lockResultMutations: false,
    passwordChangeNotifications: true,
    allowFormTeachersToPrintResults: false,
  });

  // handle manage all notifications - toggles all notifications on/off
  const handleManageAllNotifications = () => {
    toast.info("to be implemented");
  };

  return (
    <div className="space-y-6">

      {/* Email Notifications */}
      <Card className="border shadow-md">
        {/* Card Content */}
        <CardContent className="pt-4">
          <div className="space-y-6">

            {/* Preferences Section */}
            <div className="space-y-4">

              {/* Preferences Section subheading (h4) */}
              <div className="pb-2 border-b border-border">
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">Preferences</h3>
              </div>
              <div className="space-y-3">
                {/* Login Notifications */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                  <div>
                    <h5 className="text-sm font-semibold">Login Notifications</h5>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Receive notifications when there is a new login activity
                    </p>
                  </div>
                  <Switch
                    checked={notifications.loginNotifications}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications((prev) => ({ ...prev, loginNotifications: checked }))
                    }
                    className="cursor-pointer"
                  />
                </div>

                {/* Lock Result Mutations */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                  <div>
                    <h5 className="text-sm font-semibold">Lock Result Mutations</h5>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Set a daily time after which results are locked and no longer editable (for eg, after 5pm,do not allow any changes to the results)
                    </p>
                  </div>
                  <Switch
                    checked={notifications.lockResultMutations}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications((prev) => ({ ...prev, lockResultMutations: checked }))
                    }
                    className="cursor-pointer"
                  />
                </div>

                {/* Password Change Notifications */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                  <div>
                    <h5 className="text-sm font-semibold">Password Change Notifications</h5>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Receive notifications when your password is changed
                    </p>
                  </div>
                  <Switch
                    checked={notifications.passwordChangeNotifications}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications((prev) => ({ ...prev, passwordChangeNotifications: checked }))
                    }
                    className="cursor-pointer"
                  />
                </div>

                {/* Allow form teachers to print results */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                  <div>
                    <h5 className="text-sm font-semibold">Allow form teachers to print results</h5>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Allow form teachers to print results (By default, only organisation admins can print results)
                    </p>
                  </div>
                  <Switch
                    checked={notifications.allowFormTeachersToPrintResults}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications((prev) => ({ ...prev, allowFormTeachersToPrintResults: checked }))
                    }
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <Button variant="outline" size="default" className="w-full h-12 md:h-14 cursor-pointer text-sm font-medium shadow-sm hover:shadow transition-shadow" onClick={handleManageAllNotifications}>
                Manage All Notifications
              </Button>

            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}