// The client-side library helps you interact with the auth server from client components.
// The client provides methods like:
//   - authClient.signUp.email()
//   - authClient.signIn.email()
//   - authClient.signIn.social()
//   - authClient.signOut()

import { createAuthClient } from "better-auth/react";
import { emailOTPClient, inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth`,
    plugins: [
        emailOTPClient(), // Email OTP plugin
        // Allow additional fields to be passed to the sign up form
        inferAdditionalFields({
            user: {
                firstName: { type: "string", required: true },
                lastName: { type: "string", required: true },
                role: { type: "string", required: false, input: false },
                subscription: { type: "string", required: false },
            }
        }),
        twoFactorClient() 
    ]
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