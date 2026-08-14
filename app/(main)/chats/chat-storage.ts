// Thread helpers for chats (no API / storage — used by mock data and UI)

// Build a stable thread id for two organisation members
export function buildThreadId(userA: string, userB: string): string {
    const [first, second] = [userA, userB].sort();
    return `${first}:${second}`;
}

// Format message timestamp for bubbles
export function formatMessageTime(iso: string): string {
    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(iso));
}
