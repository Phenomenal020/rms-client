// The client-side library helps you interact with the auth server from client components.
// The client provides methods like:
//   - authClient.signUp.email()
//   - authClient.signIn.email()
//   - authClient.signIn.social()
//   - authClient.signOut()

import { createAuthClient } from "better-auth/react";
// import { nextCookies } from "better-auth/next-js";
// import { inferAdditionalFields } from "better-auth/client/plugins";
// import { auth } from "./auth";

// export const authClient = createAuthClient({
//     plugins: [
//         inferAdditionalFields<typeof auth>(),
//         nextCookies()  // Must be the last plugin
//     ]
// })

export const authClient = createAuthClient({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth`
})

// Type for session list items (from listSessions API)
// This matches the structure returned by better-auth's listSessions endpoint
export type SessionListItem = {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
    ipAddress?: string | null;
    userAgent?: string | null;
}

// export const authClient = createAuthClient({
//     baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth`
// })