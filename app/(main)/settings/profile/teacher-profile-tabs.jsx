"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { TeacherProfileForm } from "./teacher-profile-form";
import { EmailForm } from "./email-form";
import { PasswordForm } from "./password-form";
import { SessionManagement } from "./session-management";
import { SettingsTab } from "./settings-tab";

export default function TeacherProfileTabs({ user, hasPasswordAccount, sessions, currentSessionToken }) {
    return (
        <Tabs defaultValue="account" className="w-full">
            <TabsList className="flex justify-center w- mx-auto bg-transparent p-0 gap-0 mb-8">

                {/* Account Tab */}
                <TabsTrigger 
                    value="account" 
                    className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-3 data-[state=active]:border-b-gray-900 w-max"
                >
                    Account
                </TabsTrigger>

                {/* Email Tab */}
                <TabsTrigger 
                    value="email" 
                    className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-3 data-[state=active]:border-b-gray-900 w-max"
                >
                    Email
                </TabsTrigger>

                {/* Password Tab */}
                <TabsTrigger 
                    value="password" 
                    className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-3 data-[state=active]:border-b-gray-900 w-max"
                >
                    Password
                </TabsTrigger>

                {/* Sessions Tab */}
                <TabsTrigger 
                    value="sessions" 
                    className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-3 data-[state=active]:border-b-gray-900 w-max"
                >
                    Sessions
                </TabsTrigger>

                {/* SettingsTabs */}
                <TabsTrigger 
                    value="settings" 
                    className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-3 data-[state=active]:border-b-gray-900 w-max"
                >
                    Settings
                </TabsTrigger>
            </TabsList>

            {/* Tabs Content */}
            <div className="w-full">
                {/* Teacher Profile Tab Content - Renders basic user information */}
                <TabsContent value="account" className="mt-0 space-y-6">
                    <TeacherProfileForm user={user} />
                </TabsContent>

                {/* Email Tab Content - Renders email change form */}
                <TabsContent value="email" className="mt-0">
                    <EmailForm currentEmail={user.email} />
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