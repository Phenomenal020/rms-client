// Teacher Join Requests, Record Requests, and Dashboard Sessions for Org Admins
"use client";

import { DashboardSessions } from "../helpers/dashboard-sessions";
import { TeacherJoinRequests } from "./teacher-join-requests";
import { RecordRequests } from "./record-requests";

export function OrgDashboard() {
    return (
        <section className="space-y-10 pb-6">
            <TeacherJoinRequests />
            <RecordRequests title="Record Requests" />
            <DashboardSessions />
        </section>
    );
}