'use client';

import { Tabs, TabsContent } from "@/shadcn/ui/tabs";
import { Button } from "@/shadcn/ui/button";
import { TeacherProfileForm } from "./teacher-profile-form";
import { EmailForm } from "./email-form";
import { PasswordForm } from "./password-form";
import { SessionManagement } from "./session-management";
import { SettingsTab } from "./settings-tab";
import { getUserAccounts, getUserSessions, getCurrentSessionToken } from "@/fetcher/queries";
import Loading from "./loading";
import { useUser } from "@/contexts/user-context";
import { useState } from "react";

export default function TeacherProfileTabs() {

    // Fetch user data using SWR hook
    const { user, isLoading, error } = useUser();
    const { accounts, hasPasswordAccount, error: accountsError, isLoading: accountsLoading } = getUserAccounts(!!user);
    const { sessions, error: sessionsError, isLoading: sessionsLoading } = getUserSessions(!!user);
    const { token: currentSessionToken, error: currentSessionTokenError, isLoading: currentSessionTokenLoading } = getCurrentSessionToken(!!user);

    const [activeTab, setActiveTab] = useState("account");

    if (!user) {
        return <Loading />;
    } else {
        return (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Buttons List */}
                <div className="flex flex-wrap justify-center gap-0 mb-2">
                    <Button
                        onClick={() => setActiveTab("account")}
                        variant={activeTab === "account" ? "default" : "outline"}
                        className="h-10 cursor-pointer mb-0 rounded-sm"
                    >
                        Account
                    </Button>

                    <Button
                        onClick={() => setActiveTab("email")}
                        variant={activeTab === "email" ? "default" : "outline"}
                        className="h-10 cursor-pointer mb-0 rounded-sm"
                    >
                        Email
                    </Button>

                    <Button
                        onClick={() => setActiveTab("password")}
                        variant={activeTab === "password" ? "default" : "outline"}
                        className="h-10 cursor-pointer mb-0 rounded-sm"
                    >
                        Password
                    </Button>

                    <Button
                        onClick={() => setActiveTab("sessions")}
                        variant={activeTab === "sessions" ? "default" : "outline"}
                        className="h-10 cursor-pointer mb-0 rounded-sm"
                    >
                        Sessions
                    </Button>

                    <Button
                        onClick={() => setActiveTab("settings")}
                        variant={activeTab === "settings" ? "default" : "outline"}
                        className="h-10 cursor-pointer mb-0 rounded-sm"
                    >
                        Settings
                    </Button>
                </div>

                {/* Tabs Content */}
                <div className="w-full">
                    {/* Teacher Profile Tab Content - Renders basic user information */}
                    <TabsContent value="account" className="mt-0 space-y-4">
                        <TeacherProfileForm user={user} />
                    </TabsContent>

                    {/* Email Tab Content - Renders email change form */}
                    <TabsContent value="email" className="mt-0">
                        <EmailForm currentEmail={user?.email || ''} />
                    </TabsContent>

                    {/* Password Tab Content - Renders password change form */}
                    <TabsContent value="password" className="mt-0">
                        <PasswordForm hasPasswordAccount={hasPasswordAccount} />
                    </TabsContent>

                    {/* Sessions Tab Content - Renders user sessions */}
                    <TabsContent value="sessions" className="mt-0">
                        <SessionManagement sessions={sessions} currentSessionToken={currentSessionToken} />
                    </TabsContent>

                    {/* Settings Tab Content - Renders settings form */}
                    <TabsContent value="settings" className="mt-0">
                        <SettingsTab />
                    </TabsContent>
                </div>
            </Tabs>
        )
    }
}