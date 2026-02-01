"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import { authClient, type SessionListItem } from "@/src/auth-client";
import { UAParser } from "ua-parser-js";
import { useRouter } from "next/navigation";
import { Monitor, Smartphone, LogOut } from "lucide-react";
import { toast } from "sonner";

// Props interface for SessionManagement
interface SessionManagementProps {
    sessions: SessionListItem[];
    currentSessionToken: string;
}

// Props interface for SessionCard
interface SessionCardProps {
    session: SessionListItem;
    isCurrentSession?: boolean;
}

export function SessionManagement({ sessions, currentSessionToken }: SessionManagementProps) {

    // refresh the page when the sessions are revoked
    const router = useRouter();

    // filter the sessions to get the other sessions
    const otherSessions = sessions.filter((s) => s.token !== currentSessionToken);
    // find the current session
    const currentSession = sessions.find((s) => s.token === currentSessionToken);

    // logout everywhere - revokes all sessions including current
    async function logoutEverywhere() {
        // revoke token serverside
        const { error } = await authClient.revokeSessions()
        if (error) {
            toast.error("Failed to log out of all devices. Please try again.");
        }

        // clear browser session cookie to actually log out
        const {error: signOutError} = await authClient.signOut();
        toast.success("Successfully logged out of all devices.");
        router.push('/sign-in');
    }

    return (
        <div className="space-y-6">

            {/* Logout Everywhere + intro */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground space-y-1">
                    <CardTitle className="text-xl sm:text-2xl text-gray-700 uppercase tracking-wide">Session security</CardTitle>
                    <p>Review where you&apos;re signed in and revoke access on other devices.</p>
                </div>
                <Button
                    variant="destructive"
                    size="default"
                    className="cursor-pointer gap-2 font-semibold rounded-full px-5 shadow-sm hover:shadow-md transition-all"
                    onClick={logoutEverywhere}
                >
                    <LogOut className="h-4 w-4" />
                    Logout Everywhere
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                {/* Current Session */}
                <div className="space-y-4">
                    {currentSession && <SessionCard session={currentSession} isCurrentSession />}
                </div>

                {/* Other Active Sessions */}
                <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Other active sessions</h3>

                    {otherSessions.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-8 text-center text-muted-foreground text-sm">
                                No other active sessions
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {otherSessions.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SessionCard({ session, isCurrentSession = false }: SessionCardProps) {

    // get the user agent information
    const router = useRouter();
    const userAgentInfo = session.userAgent ? UAParser(session.userAgent) : null;

    // get the browser information
    function getBrowserInformation(): string {
        if (userAgentInfo == null) return "Unknown Device";
        if (userAgentInfo.browser.name == null && userAgentInfo.os.name == null) {
            return "Unknown Device";
        }
        if (userAgentInfo.browser.name == null) return userAgentInfo.os.name || "Unknown Device";
        if (userAgentInfo.os.name == null) return userAgentInfo.browser.name || "Unknown Device";
        return `${userAgentInfo.browser.name}, ${userAgentInfo.os.name}`;
    }

    // format the date
    function formatDate(date: Date | string): string {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(date));
    }

    return (
        <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow rounded-xl bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                    {getBrowserInformation()}
                </CardTitle>
                {isCurrentSession && (
                    <Badge
                        variant="default"
                        className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                        Current session
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        {userAgentInfo?.device.type === "mobile" ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-sm text-muted-foreground">
                            Created: <span className="font-medium text-gray-800">{formatDate(session.createdAt)}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Expires: <span className="font-medium text-gray-800">{formatDate(session.expiresAt)}</span>
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

