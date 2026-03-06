"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Switch } from "@/shadcn/ui/switch";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";

// schema for the delete account form
const deleteAccountSchema = z.object({
  confirmation: z.string().refine(
    (val) => val === "Delete My Account",
    {
      message: "Please type 'Delete My Account' to confirm",
    }
  ),
});

export function SettingsTab() {

  // state for the notifications. TODO: Add these to the User model
  const [notifications, setNotifications] = useState({
    loginNotifications: true,
    emailChangeNotifications: false,
    passwordChangeNotifications: true,
    profileUpdateNotifications: true,
    printNotifications: true,
    exportNotifications: true,
  });

  // useform hook for the delete account form
  const deleteAccountForm = useForm({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmation: "",
    },
  });

  // TODO: Implement delete account
  const handleDeleteAccount = async () => {
    toast.info("to be implemented");
    deleteAccountForm.reset();
  };

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

            {/* Email Notifications Section */}
            <div className="space-y-4">

              {/* Email Notifications Section subheading (h4) */}
              <div className="pb-2 border-b border-border">
                <h4 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">Email Notifications</h4>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                  <div>
                    <h6 className="text-sm md:text-base font-semibold">Login Notifications</h6>
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

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                  <div>
                    <h6 className="text-sm md:text-base font-semibold">Email Change Notifications</h6>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Receive notifications when your email address is changed
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailChangeNotifications}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications((prev) => ({ ...prev, emailChangeNotifications: checked }))
                    }
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                  <div>
                    <h6 className="text-sm md:text-base font-semibold">Password Change Notifications</h6>
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

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                  <div>
                    <h6 className="text-sm md:text-base font-semibold">Print Notifications</h6>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Receive notifications when the results are printed
                    </p>
                  </div>
                  <Switch
                    checked={notifications.printNotifications}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications((prev) => ({ ...prev, printNotifications: checked }))
                    }
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                  <div>
                    <h6 className="text-sm md:text-base font-semibold">Export Notifications</h6>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Receive notifications when the results are exported
                    </p>
                  </div>
                  <Switch
                    checked={notifications.exportNotifications}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications((prev) => ({ ...prev, exportNotifications: checked }))
                    }
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <Button variant="outline" size="default" className="w-full h-10 md:h-14 cursor-pointer text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow" onClick={handleManageAllNotifications}>
                Manage All Notifications
              </Button>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border shadow-md border-destructive/50">
        {/* Card Content */}
        <CardContent className="pt-4">
          <div className="space-y-6">

            {/* Danger Zone Section */}
            <div className="space-y-4">

              {/* Danger Zone Section subheading (h4) */}
              <div className="pb-2 border-b border-border">
                <h4 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">Danger Zone</h4>
              </div>

              <div>
                <h4 className="text-sm md:text-base font-semibold mb-2">Delete Account</h4>
                <p className="text-xs md:text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back.
                </p>
                <Form {...deleteAccountForm}>
                  <form
                    onSubmit={deleteAccountForm.handleSubmit(handleDeleteAccount)}
                    className="space-y-4"
                  >
                    <FormField
                      control={deleteAccountForm.control}
                      name="confirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm md:text-base font-semibold">
                            Type <span className="font-mono text-destructive">Delete My Account</span> to confirm
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Delete My Account"
                              className="h-10 md:h-14 text-sm md:text-base cursor-text"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 md:pt-6 border-t border-border mt-4 md:mt-6">
                      <div className="flex justify-center">
                        <Button
                          type="submit"
                          variant="destructive"
                          size="lg"
                          className="w-full sm:w-auto min-w-[160px] h-10 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                          disabled={deleteAccountForm.watch("confirmation") !== "Delete My Account"}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete My Account
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}