export type ChatMember = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    membershipRole: string;
    isOrgAdmin: boolean;
    isFormTeacher?: boolean;
};

/** Share-link request lifecycle — request, then form teacher approves or rejects. */
export type ShareLinkRequestStatus = "pending" | "approved" | "rejected";

export type ShareLinkRequestPayload = {
    requestId: string;
    className: string;
    subjectName: string;
    assessmentType: string;
    minScore: number;
    maxScore: number;
    status: ShareLinkRequestStatus;
    requestedBy: string;
    formTeacherId: string;
    /** Set when approved — dummy URL until API is wired. */
    shareLinkUrl?: string;
    rejectionReason?: string;
};

export type ChatMessage = {
    id: string;
    threadId: string;
    createdAt: string;
    type: "share_link_request";
    payload: ShareLinkRequestPayload;
};

export type MockClass = {
    id: string;
    name: string;
    formTeacherId: string;
};
