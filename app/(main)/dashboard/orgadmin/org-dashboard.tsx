"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { DashboardSessions } from "../helpers/dashboard-sessions";
import { TeacherJoinRequests } from "./teacher-join-requests";
import Profile from "../(profile)/profile";
// import { RecordRequests } from "./record-requests";

export function OrgDashboard() {
    return (
        <>
            {/* TODO: Recent activity table */}

            <Tabs defaultValue="teacher-join" className="mt-8 pt-0">
                {/* Tabs List */}
                <TabsList variant="line">
                    <TabsTrigger value="teacher-join" className="cursor-pointer">Join Requests</TabsTrigger>
                    <TabsTrigger value="sessions" className="cursor-pointer">Security</TabsTrigger>
                    <TabsTrigger value="profile" className="cursor-pointer">Profile</TabsTrigger>
                </TabsList>

                {/* Tabs Content: Teacher Join Requests */}
                <TabsContent value="teacher-join" className="mt-2">
                    <TeacherJoinRequests />
                </TabsContent>

                {/* Tabs Content: Sessions */}
                <TabsContent value="sessions" className="mt-2">
                    <DashboardSessions />
                </TabsContent>

                 {/* Tabs Content: Profile */}
                 <TabsContent value="profile" className="mt-2">
                    <Profile />
                </TabsContent>
            </Tabs>
        </>
    );
}