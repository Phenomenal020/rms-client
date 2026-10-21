"use client";

import { Card, CardContent } from "@/shadcn/ui/card";
import { authClient, type SessionListItem } from "@/src/auth-client";
import { getApiErrorMessage } from "@/fetcher/mutations";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { UAParser } from "ua-parser-js";
import { usePathname, useRouter } from "next/navigation";
import { Monitor, Smartphone, LogOut } from "lucide-react";
import { toast } from "sonner";
import { EmptyPending } from "@/shared-components/empty-pending";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LoadingButton } from "@/shared-components/loading-button";

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
    const pathname = usePathname();
    const otherSessions = sessions.filter((s) => s.token !== currentSessionToken);
    const currentSession = sessions.find((s) => s.token === currentSessionToken);
    const [loggedOutEveryWhere, setLoggedOutEveryWhere] = useState(false);

    // Logout everywhere function
    async function logoutEverywhere() {
        // set the state to true to prevent the user from clicking the button again
        setLoggedOutEveryWhere(true);
        // revoke all sessions including the current session
        const { error: revokeSessionsError } = await authClient.revokeSessions();
        // If there is an error, check if it is a 401/403 and handle the redirect accordingly
        if (revokeSessionsError) {
            if (handleAuthRedirect(revokeSessionsError, { router, pathname })) {
                return;
            }
            toast.error(
                getApiErrorMessage(revokeSessionsError, "Failed to log out of all devices. Please try again."),
            );
            setLoggedOutEveryWhere(false);
            return;
        }
        // Clear session cookie from this browser
        const { error: signOutError } = await authClient.signOut();
        if (signOutError) {
            if (handleAuthRedirect(signOutError, { router, pathname })) {
                return;
            }
            router.push("/sign-in");
            toast.error("Sessions revoked. Please sign in again.");
            return;
        }
        // Finally, show success toast and redirect to sign-in page
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
                    <LoadingButton
                        loading={loggedOutEveryWhere}
                        disabled={loggedOutEveryWhere}
                        onClick={logoutEverywhere}
                        variant="destructive"
                        size="sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout everywhere
                    </LoadingButton>
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
                        <EmptyPending
                            embedded
                            title="No other active sessions"
                            description="You are only signed in on this device."
                        />
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
            {/* Todo: Add a logout button to the session row to log that particular session out */}
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
