"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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

const deleteAccountSchema = z.object({
  confirmation: z.literal("Delete My Account", {
    errorMap: () => ({ message: "Please type 'Delete My Account' to confirm" }),
  }),
});

export function SettingsTab() {
  const [notifications, setNotifications] = useState({
    progressUpdates: true,
    achievementAlerts: true,
    gameInvitations: true,
  });

  const deleteAccountForm = useForm({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmation: "",
    },
  });

  const handleDeleteAccount = async () => {
    toast.info("to be implemented");
    deleteAccountForm.reset();
  };

  const handleManageAllNotifications = () => {
    toast.info("to be implemented");
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-xl bg-primary p-2.5 shadow-md">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Email Notifications
            </span>
          </CardTitle>
          <p className="text-base mt-2 text-muted-foreground">
            Control how and when you receive updates about your Scrabble journey
          </p>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <h4 className="font-semibold">Progress Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Weekly summary of your learning progress
                </p>
              </div>
              <Switch
                checked={notifications.progressUpdates}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, progressUpdates: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <h4 className="font-semibold">Achievement Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Get notified when you unlock new achievements
                </p>
              </div>
              <Switch
                checked={notifications.achievementAlerts}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, achievementAlerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <h4 className="font-semibold">Game Invitations</h4>
                <p className="text-sm text-muted-foreground">
                  Notifications when friends challenge you
                </p>
              </div>
              <Switch
                checked={notifications.gameInvitations}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, gameInvitations: checked }))
                }
              />
            </div>
          </div>

          <Button variant="outline" className="w-full cursor-pointer" onClick={handleManageAllNotifications}>
            Manage All Notifications
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-destructive/50 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10">
          <CardTitle className="flex items-center gap-3 text-xl text-destructive">
            <div className="rounded-xl bg-destructive/20 p-2 border border-destructive/30">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            Danger Zone
          </CardTitle>
          <p className="text-base mt-2 text-destructive/80">
            Irreversible and destructive actions - proceed with caution
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Delete Account</h4>
              <p className="text-sm text-muted-foreground mb-4">
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
                        <FormLabel className="text-base font-semibold">
                          Type <span className="font-mono text-destructive">Delete My Account</span> to confirm
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Delete My Account"
                            className="h-11 cursor-text"
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
                    className="w-full cursor-pointer"
                    disabled={deleteAccountForm.watch("confirmation") !== "Delete My Account"}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
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

