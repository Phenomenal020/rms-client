"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { TeacherProfileForm } from "./teacher-profile-form";
import { EmailForm } from "./email-form";
import { PasswordForm } from "./password-form";
import { SessionManagement } from "./session-management";
import { SettingsTab } from "./settings-tab";
import type { SessionListItem } from "@/src/lib/auth";
import type { UserData } from "./types";

// Props interface for TeacherProfileTabs
interface TeacherProfileTabsProps {
  user: UserData;
  hasPasswordAccount: boolean;
  sessions: SessionListItem[];
  currentSessionToken: string;
}

export default function TeacherProfileTabs({ user, hasPasswordAccount, sessions, currentSessionToken }: TeacherProfileTabsProps) {
    return (
        <Tabs defaultValue="account" className="w-full">
            {/* Tabs List */}
            <TabsList className="flex justify-center w-full mx-auto bg-white/60 backdrop-blur-sm rounded-lg p-1 gap-1 mb-8 shadow-sm border border-blue-100/50">

                {/* Account Tab */}
                <TabsTrigger 
                    value="account" 
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 rounded-md hover:text-blue-700 hover:bg-blue-50/50 data-[state=active]:text-primary-700 data-[state=active]:bg-blue-100/70 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200/50"
                >
                    Account
                </TabsTrigger>

                {/* Email Tab */}
                <TabsTrigger 
                    value="email" 
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 rounded-md hover:text-blue-700 hover:bg-blue-50/50 data-[state=active]:text-primary-700 data-[state=active]:bg-blue-100/70 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200/50"
                >
                    Email
                </TabsTrigger>

                {/* Password Tab */}
                <TabsTrigger 
                    value="password" 
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 rounded-md hover:text-blue-700 hover:bg-blue-50/50 data-[state=active]:text-primary-700 data-[state=active]:bg-blue-100/70 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200/50"
                >
                    Password
                </TabsTrigger>

                {/* Sessions Tab */}
                <TabsTrigger 
                    value="sessions" 
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 rounded-md hover:text-blue-700 hover:bg-blue-50/50 data-[state=active]:text-primary-700 data-[state=active]:bg-blue-100/70 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200/50"
                >
                    Sessions
                </TabsTrigger>

                {/* Settings Tab */}
                <TabsTrigger 
                    value="settings" 
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 rounded-md hover:text-blue-700 hover:bg-blue-50/50 data-[state=active]:text-primary-700 data-[state=active]:bg-blue-100/70 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200/50"
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