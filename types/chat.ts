export type ChatMember = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    membershipRole: string;
    isOrgAdmin: boolean;
};

export type ChatMessage = {
    id: string;
    threadId: string;
    senderId: string;
    receiverId: string;
    body: string;
    createdAt: string;
};
