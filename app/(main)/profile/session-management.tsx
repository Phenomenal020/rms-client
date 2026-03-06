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
        <Card className="border shadow-md">
            {/* Card Content */}
            <CardContent className="pt-4">
                <div className="space-y-6">

                    {/* Session Security Section */}
                    <div className="space-y-4">

                        {/* Session Security Section subheading (h4) */}
                        <div className="pb-2 border-b border-border">
                            <h4 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">Session Security</h4>
                        </div>

                        {/* Logout Everywhere + intro */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm md:text-base text-muted-foreground space-y-1">
                                <p>Review where you&apos;re signed in and revoke access on other devices.</p>
                            </div>
                            <Button
                                variant="destructive"
                                size="default"
                                className="cursor-pointer gap-2 font-semibold rounded-full px-5 shadow-sm hover:shadow-md transition-all w-full sm:w-auto h-10 md:h-14 text-sm md:text-base"
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
                                <h3 className="text-base md:text-lg sm:text-xl font-semibold text-foreground">Other active sessions</h3>

                                {otherSessions.length === 0 ? (
                                    <Card className="border-dashed">
                                        <CardContent className="py-8 text-center text-muted-foreground text-sm md:text-base">
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
                </div>
            </CardContent>
        </Card>
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
        <Card className="border border-border shadow-sm hover:shadow-md transition-shadow rounded-xl bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
                <CardTitle className="text-base md:text-lg sm:text-xl font-semibold text-card-foreground">
                    {getBrowserInformation()}
                </CardTitle>
                {isCurrentSession && (
                    <Badge
                        variant="default"
                        className="bg-primary/15 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                        Current session
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {userAgentInfo?.device.type === "mobile" ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-sm md:text-base text-muted-foreground">
                            Created: <span className="font-medium text-foreground">{formatDate(session.createdAt)}</span>
                        </p>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Expires: <span className="font-medium text-foreground">{formatDate(session.expiresAt)}</span>
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

