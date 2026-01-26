"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import { authClient } from "@/src/lib/auth-client";
import { type SessionListItem } from "@/src/lib/auth";
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
        const { error } = await authClient.revokeSessions()
        if (error) {
            toast.error("Failed to log out of all devices. Please try again.");
        } else {
            toast.success("Successfully logged out of all devices.");
            router.refresh();
        }
    }

    return (
        <div className="space-y-6">

            {/* Logout Everywhere Button */}
            <div className="flex justify-end">
                <Button
                    variant="destructive"
                    size="default"
                    className="cursor-pointer gap-2 font-medium"
                    onClick={logoutEverywhere}
                >
                    <LogOut className="h-4 w-4" />
                    Logout Everywhere
                </Button>
            </div>

            {/* Current Session */}
            {currentSession && <SessionCard session={currentSession} isCurrentSession />}

            {/* Other Active Sessions */}
            <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-medium">Other Active Sessions</h3>

                {otherSessions.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
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
        <Card>
            <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-xl sm:text-2xl font-gray-700">{getBrowserInformation()}</CardTitle>
                {isCurrentSession && <Badge variant="default" className="bg-primary text-primary-foreground p-2 font-semibold">Current Session</Badge>}
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-3">
                    {userAgentInfo?.device.type === "mobile" ? <Smartphone /> : <Monitor />}
                    <div>
                        <p className="text-base text-muted-foreground">Created: {formatDate(session.createdAt)}</p>
                        <p className="text-base text-muted-foreground">Expires: {formatDate(session.expiresAt)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

