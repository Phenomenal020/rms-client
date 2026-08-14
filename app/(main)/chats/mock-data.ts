import type { ChatMember, ChatMessage } from "@/types/chat";
import { buildThreadId } from "./chat-storage";

// Placeholder current user — replace with session user when API is wired up
export const MOCK_CURRENT_USER = {
    id: "member-me",
    name: "You",
    email: "you@school.edu",
    role: "user" as const,
};

// Placeholder organisation members
export const MOCK_CHAT_MEMBERS: ChatMember[] = [
    {
        id: "member-admin-1",
        name: "Mrs. Adaeze Okonkwo",
        email: "adaeze.okonkwo@school.edu",
        image: null,
        membershipRole: "admin",
        isOrgAdmin: true,
    },
    {
        id: "member-teacher-1",
        name: "Mr. Chidi Nwosu",
        email: "chidi.nwosu@school.edu",
        image: null,
        membershipRole: "member",
        isOrgAdmin: false,
    },
    {
        id: "member-teacher-2",
        name: "Ms. Fatima Bello",
        email: "fatima.bello@school.edu",
        image: null,
        membershipRole: "member",
        isOrgAdmin: false,
    },
    {
        id: "member-teacher-3",
        name: "Mr. Emeka Eze",
        email: "emeka.eze@school.edu",
        image: null,
        membershipRole: "member",
        isOrgAdmin: false,
    },
];

// Seed a couple of threads so the UI feels alive
export function buildMockSeedMessages(): Record<string, ChatMessage[]> {
    const adminThread = buildThreadId(MOCK_CURRENT_USER.id, "member-admin-1");
    const teacherThread = buildThreadId(MOCK_CURRENT_USER.id, "member-teacher-1");

    return {
        [adminThread]: [
            {
                id: "seed-1",
                threadId: adminThread,
                senderId: MOCK_CURRENT_USER.id,
                receiverId: "member-admin-1",
                body: "Please approve my JSS 2A result export when you get a moment.",
                createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            },
            {
                id: "seed-2",
                threadId: adminThread,
                senderId: "member-admin-1",
                receiverId: MOCK_CURRENT_USER.id,
                body: "Got it — I'll review it this afternoon.",
                createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
            },
        ],
        [teacherThread]: [
            {
                id: "seed-3",
                threadId: teacherThread,
                senderId: "member-teacher-1",
                receiverId: MOCK_CURRENT_USER.id,
                body: "Are we sharing result links with parents this term?",
                createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            },
        ],
    };
}
