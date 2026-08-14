"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { SecuritySetupModal } from "@/shared-components/security-setup-modal";

import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import { Card } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Textarea } from "@/shadcn/ui/textarea";

import { ArrowLeft, Crown, MessageCircle, Search, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import type { ChatMember, ChatMessage } from "@/types/chat";
import { buildThreadId, formatMessageTime } from "./chat-storage";
import {
    buildMockSeedMessages,
    MOCK_CHAT_MEMBERS,
    MOCK_CURRENT_USER,
} from "./mock-data";

const QUICK_MESSAGES = [
    "Please approve my result export when you can.",
    "Could you review the class record I submitted?",
    "Result link sharing — coming soon on my end.",
    "Thanks for the quick turnaround!",
];

type ChatsPanelProps = {
    fallback?: ReactNode;
};

// Avatar initials helper
function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

// Chats panel component — WhatsApp-inspired layout (placeholder data only)
export function ChatsPanel({ fallback = null }: ChatsPanelProps) {
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();

    const canChat = user?.role === "orgadmin" || user?.role === "user";
    const currentUserId = MOCK_CURRENT_USER.id;

    const [memberSearch, setMemberSearch] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [draftMessage, setDraftMessage] = useState("");
    const [threads, setThreads] = useState<Record<string, ChatMessage[]>>(() => buildMockSeedMessages());

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Redirect non-org members away from chats
    useEffect(() => {
        if (!isUserLoading && user && !canChat) {
            router.replace("/dashboard");
        }
    }, [isUserLoading, user, canChat, router]);

    // Placeholder contacts — admins first
    const contacts = useMemo(() => {
        return [...MOCK_CHAT_MEMBERS].sort((a, b) => {
            if (a.isOrgAdmin !== b.isOrgAdmin) return a.isOrgAdmin ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    }, []);

    const filteredContacts = useMemo(() => {
        const query = memberSearch.trim().toLowerCase();
        if (!query) return contacts;
        return contacts.filter((member) =>
            member.name.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query),
        );
    }, [contacts, memberSearch]);

    const selectedMember = contacts.find((member) => member.id === selectedMemberId) ?? null;
    const threadId = selectedMember
        ? buildThreadId(currentUserId, selectedMember.id)
        : null;

    const messages = threadId ? (threads[threadId] ?? []) : [];

    // Scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedMemberId]);

    function getLastMessagePreview(memberId: string): string | null {
        const id = buildThreadId(currentUserId, memberId);
        const threadMessages = threads[id] ?? [];
        return threadMessages[threadMessages.length - 1]?.body ?? null;
    }

    // Send a message — in-memory only for now
    function handleSendMessage(bodyOverride?: string) {
        if (!selectedMember || !threadId) return;

        const body = (bodyOverride ?? draftMessage).trim();
        if (!body) return;

        const message: ChatMessage = {
            id: crypto.randomUUID(),
            threadId,
            senderId: currentUserId,
            receiverId: selectedMember.id,
            body,
            createdAt: new Date().toISOString(),
        };

        const payload = {
            message,
            sender: MOCK_CURRENT_USER,
            receiver: {
                id: selectedMember.id,
                name: selectedMember.name,
                isOrgAdmin: selectedMember.isOrgAdmin,
            },
        };

        // No backend yet — inspect collected data in the console
        console.log("[chats] send message:", payload);

        setThreads((prev) => ({
            ...prev,
            [threadId]: [...(prev[threadId] ?? []), message],
        }));
        setDraftMessage("");
    }

    if (isUserLoading || !user) {
        return fallback;
    }

    if (!canChat) {
        return null;
    }

    const showMobileChat = !!selectedMember;

    return (
        <>
            <section className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <MessageCircle className="h-8 w-8 text-primary" />
                    Chats
                </h1>
                <p className="text-sm text-muted-foreground">
                    Quick internal messages with teachers and organisation admins — reminders, exports, and more.
                </p>
            </section>

            <SecuritySetupModal />

            <Card className="border shadow-md overflow-hidden h-[calc(100vh-11rem)] min-h-[560px]">
                <div className="grid h-full md:grid-cols-[340px_1fr]">

                    {/* Member list — WhatsApp-style sidebar */}
                    <aside
                        className={cn(
                            "flex h-full flex-col border-r border-border bg-muted/20",
                            showMobileChat ? "hidden md:flex" : "flex",
                        )}
                    >
                        <div className="border-b border-border bg-card px-4 py-4 space-y-3">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Organisation</h2>
                                <p className="text-xs text-muted-foreground">
                                    {contacts.length} member{contacts.length === 1 ? "" : "s"} · placeholder data
                                </p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    placeholder="Search members..."
                                    className="h-10 pl-9 bg-background"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredContacts.length === 0 ? (
                                <p className="p-6 text-center text-sm text-muted-foreground">
                                    No members match your search.
                                </p>
                            ) : (
                                filteredContacts.map((member) => {
                                    const preview = getLastMessagePreview(member.id);
                                    const isActive = selectedMemberId === member.id;

                                    return (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() => setSelectedMemberId(member.id)}
                                            className={cn(
                                                "flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-accent/60",
                                                isActive && "bg-accent",
                                            )}
                                        >
                                            <MemberAvatar member={member} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate font-medium text-foreground">
                                                        {member.name}
                                                    </p>
                                                    {member.isOrgAdmin && (
                                                        <Badge
                                                            variant="outline"
                                                            className="shrink-0 border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-[10px] uppercase tracking-wide"
                                                        >
                                                            Admin
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {preview ?? member.email}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    {/* Conversation panel */}
                    <section
                        className={cn(
                            "flex h-full flex-col bg-[#efeae2] dark:bg-muted/30",
                            !showMobileChat && "hidden md:flex",
                        )}
                    >
                        {!selectedMember ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <MessageCircle className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    Select a conversation
                                </h3>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    Pick a teacher or organisation admin to send reminders, follow up on exports, or share updates.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Chat header */}
                                <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden shrink-0"
                                        onClick={() => setSelectedMemberId(null)}
                                        aria-label="Back to members"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <MemberAvatar member={selectedMember} size="md" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="truncate font-semibold text-foreground">
                                                {selectedMember.name}
                                            </h2>
                                            {selectedMember.isOrgAdmin && (
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0 border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-[10px] uppercase tracking-wide"
                                                >
                                                    <Crown className="mr-1 h-3 w-3" />
                                                    Org Admin
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {selectedMember.email}
                                        </p>
                                    </div>
                                </header>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                                    {messages.length === 0 ? (
                                        <div className="flex h-full items-center justify-center">
                                            <p className="rounded-full bg-card/80 px-4 py-2 text-xs text-muted-foreground shadow-sm">
                                                No messages yet. Say hello or use a quick reminder below.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((message) => {
                                            const isMine = message.senderId === currentUserId;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={cn(
                                                        "flex",
                                                        isMine ? "justify-end" : "justify-start",
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "max-w-[85%] rounded-lg px-3 py-2 shadow-sm",
                                                            isMine
                                                                ? "bg-emerald-600 text-white rounded-br-none"
                                                                : "bg-card text-foreground rounded-bl-none border border-border/60",
                                                        )}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap break-words">
                                                            {message.body}
                                                        </p>
                                                        <p
                                                            className={cn(
                                                                "mt-1 text-[10px] text-right",
                                                                isMine ? "text-emerald-100" : "text-muted-foreground",
                                                            )}
                                                        >
                                                            {formatMessageTime(message.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick reminders */}
                                <div className="border-t border-border bg-card/90 px-4 py-2">
                                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                        Quick reminders
                                    </p>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {QUICK_MESSAGES.map((template) => (
                                            <Button
                                                key={template}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="shrink-0 h-8 text-xs cursor-pointer bg-background"
                                                onClick={() => handleSendMessage(template)}
                                            >
                                                {template.length > 42 ? `${template.slice(0, 42)}…` : template}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Composer */}
                                <footer className="border-t border-border bg-card p-3">
                                    <form
                                        className="flex items-end gap-2"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }}
                                    >
                                        <Textarea
                                            value={draftMessage}
                                            onChange={(e) => setDraftMessage(e.target.value)}
                                            placeholder="Type a message"
                                            rows={1}
                                            className="min-h-10 max-h-28 resize-none bg-background"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            className="h-10 w-10 shrink-0 rounded-full cursor-pointer"
                                            disabled={!draftMessage.trim()}
                                            aria-label="Send message"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </footer>
                            </>
                        )}
                    </section>
                </div>
            </Card>
        </>
    );
}

function MemberAvatar({
    member,
    size = "sm",
}: {
    member: ChatMember;
    size?: "sm" | "md";
}) {
    const dimension = size === "md" ? "h-11 w-11 text-sm" : "h-10 w-10 text-xs";

    return (
        <div
            className={cn(
                "flex shrink-0 items-center justify-center rounded-full font-semibold",
                dimension,
                member.isOrgAdmin
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 ring-2 ring-amber-500/30"
                    : "bg-primary/10 text-primary",
            )}
        >
            {getInitials(member.name)}
        </div>
    );
}
