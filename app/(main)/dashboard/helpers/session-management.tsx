"use client";

import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { authClient, type SessionListItem } from "@/src/auth-client";
import { UAParser } from "ua-parser-js";
import { useRouter } from "next/navigation";
import { Monitor, Smartphone, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Session management component props
interface SessionManagementProps {
    sessions: SessionListItem[];
    currentSessionToken: string;
}

// Session row component props
interface SessionRowProps {
    session: SessionListItem;
    isCurrentSession?: boolean;
}

// Format date function
function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

// Get browser information function
function getBrowserInformation(userAgent: string | null | undefined): string {
    if (!userAgent) return "Unknown Device";
    const info = UAParser(userAgent);
    if (info.browser.name == null && info.os.name == null) return "Unknown Device";
    if (info.browser.name == null) return info.os.name || "Unknown Device";
    if (info.os.name == null) return info.browser.name || "Unknown Device";
    return `${info.browser.name}, ${info.os.name}`;
}

// Check if device is mobile function
function isMobileDevice(userAgent: string | null | undefined): boolean {
    if (!userAgent) return false;
    return UAParser(userAgent).device.type === "mobile";
}

export function SessionManagement({ sessions, currentSessionToken }: SessionManagementProps) {
    // Get other sessions and current session
    const router = useRouter();
    const otherSessions = sessions.filter((s) => s.token !== currentSessionToken);
    const currentSession = sessions.find((s) => s.token === currentSessionToken);

    // Logout everywhere function
    async function logoutEverywhere() {
        // revoke all sessions
        const { error: revokeSessionsError } = await authClient.revokeSessions();
        // if error, show error toast
        if (revokeSessionsError) {
            toast.error("Failed to log out of all devices. Please try again.");
            return;
        }
        // else, sign out
        const { error: signOutError } = await authClient.signOut();
        // if error, show error toast
        if (signOutError) {
            toast.error("Failed to sign out. Please try again.");
            return;
        }
        // else, show success toast and redirect to sign-in page
        toast.success("Successfully logged out of all devices.");
        router.push("/sign-in");
    }

    return (
        <Card className="border border-border bg-card shadow-md">
            <CardContent className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h4 className="text-lg font-semibold tracking-tight text-foreground">
                            Sessions
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Devices where you&apos;re signed in.
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="shrink-0 gap-2 border-destructive/40 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        onClick={logoutEverywhere}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout everywhere
                    </Button>
                </div>

                {/* Current session */}
                {currentSession && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            This device
                        </p>
                        <SessionRow session={currentSession} isCurrentSession />
                    </div>
                )}

                {/* Other sessions */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Other active sessions
                    </p>

                    {otherSessions.length === 0 ? (
                        <p className="rounded-md border border-dashed border-border/80 px-4 py-6 text-center text-sm text-muted-foreground">
                            No other active sessions
                        </p>
                    ) : (
                        <ul className="divide-y divide-border border-y border-border">
                            {otherSessions.map((session) => (
                                <li key={session.id}>
                                    <SessionRow session={session} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Session row component
function SessionRow({ session, isCurrentSession = false }: SessionRowProps) {
    const label = getBrowserInformation(session.userAgent);
    const mobile = isMobileDevice(session.userAgent);
    const Icon = mobile ? Smartphone : Monitor;

    return (
        <div
            className={cn(
                "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
                isCurrentSession && "rounded-md border border-border bg-muted/40 px-4",
                !isCurrentSession && "px-1",
            )}
        >
            <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 space-y-1">
                    {/* Label */}
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-foreground">{label}</p>
                        {isCurrentSession && (
                            <span className="text-xs font-medium text-primary">
                                Current
                            </span>
                        )}
                    </div>
                    {/* Created date */}
                    <p className="text-sm tabular-nums text-muted-foreground">
                        Created {formatDate(session.createdAt)}
                        <span className="mx-1.5 text-border">·</span>
                    </p>
                    {/* Expires date */}
                    <p className="text-sm tabular-nums text-muted-foreground">
                        Expires {formatDate(session.expiresAt)}
                    </p>
                </div>
            </div>
        </div>
    );
}
