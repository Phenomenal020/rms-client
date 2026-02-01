"use client";

import { useState } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Switch } from "@/shadcn/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Bell, AlertTriangle, Trash2 } from "lucide-react";
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

  // state for the notifications
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
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8">

        {/* Card Header */}
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-4">
          <CardTitle className="flex items-center gap-3 text-2xl sm:text-3xl">
            <div className="rounded-xl bg-primary p-2 shadow-md">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent text-xl sm:text-2xl">
                Email Notifications
              </p>
              <p className="text-sm sm:text-base mt-1 text-muted-foreground">
                Manage your email notification preferences
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <h4 className="text-base font-semibold">Login Notifications</h4>
                <p className="text-sm sm:text-base text-muted-foreground">
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

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <h4 className="text-base font-semibold">Email Change Notifications</h4>
                <p className="text-sm sm:text-base text-muted-foreground">
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

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <h4 className="text-base font-semibold">Password Change Notifications</h4>
                <p className="text-sm sm:text-base text-muted-foreground">
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

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <h4 className="text-base font-semibold">Profile Update Notifications</h4>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Receive notifications when your profile information is updated
                </p>
              </div>
              <Switch
                checked={notifications.profileUpdateNotifications}
                onCheckedChange={(checked: boolean) =>
                  setNotifications((prev) => ({ ...prev, profileUpdateNotifications: checked }))
                }
                className="cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <h4 className="text-base font-semibold">Print Notifications</h4>
                <p className="text-sm sm:text-base text-muted-foreground">
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

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <h4 className="text-base font-semibold">Export Notifications</h4>
                <p className="text-sm sm:text-base text-muted-foreground">
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

          <Button variant="outline" size="default" className="w-full h-14 cursor-pointer text-sm sm:text-base font-gray-700 shadow-sm hover:shadow transition-shadow" onClick={handleManageAllNotifications}>
            Manage All Notifications
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-destructive/50 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10 py-4">
          <CardTitle className="flex items-center gap-3 text-2xl text-destructive">
            <div className="rounded-xl bg-destructive/20 p-2 border border-destructive/30">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent text-xl sm:text-2xl">
                Danger Zone
              </p>
              <p className="text-sm sm:text-base mt-1 text-destructive/80">
                Irreversible and destructive actions - proceed with caution
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div>
            <div>
              <h4 className="text-base font-semibold">Delete Account</h4>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
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
                        <FormLabel className="text-base sm:text-lg font-semibold">
                          Type <span className="font-mono text-destructive">Delete My Account</span> to confirm
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Delete My Account"
                            className="h-14 text-base cursor-text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    variant="destructive"
                    size="lg"
                    className="w-full h-14 text-sm sm:text-base font-gray-700 shadow-sm hover:shadow transition-shadow cursor-pointer"
                    disabled={deleteAccountForm.watch("confirmation") !== "Delete My Account"}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete My Account
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}