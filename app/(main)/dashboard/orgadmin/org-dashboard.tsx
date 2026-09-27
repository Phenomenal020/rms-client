"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { DashboardSessions } from "../helpers/dashboard-sessions";
import { TeacherJoinRequests } from "./teacher-join-requests";
// import { RecordRequests } from "./record-requests";

export function OrgDashboard() {
    return (
        <>
            {/* TODO: Recent activity table */}

            <Tabs defaultValue="teacher-join" className="mt-0 pt-0">
                {/* Tabs List */}
                <TabsList variant="line">
                    {/* <TabsTrigger value="recent-activity" className="cursor-pointer">Recent Activity</TabsTrigger> */}
                    <TabsTrigger value="teacher-join" className="cursor-pointer">Join Requests</TabsTrigger>
                    {/* <TabsTrigger value="record-requests" className="cursor-pointer">Record Requests</TabsTrigger> */}
                    <TabsTrigger value="sessions" className="cursor-pointer">Security</TabsTrigger>
                </TabsList>

                {/* Tabs Content: Teacher Join Requests */}
                <TabsContent value="teacher-join" className="mt-2">
                    <TeacherJoinRequests />
                </TabsContent>

                {/* Tabs Content: Record Requests */}
                {/* <TabsContent value="record-requests" className="mt-2">
                    <RecordRequests title="Record Requests" />
                </TabsContent> */}

                {/* Tabs Content: Sessions */}
                <TabsContent value="sessions" className="mt-2">
                    <DashboardSessions />
                </TabsContent>
            </Tabs>
        </>
    );
}