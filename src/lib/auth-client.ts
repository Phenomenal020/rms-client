// The client-side library helps you interact with the auth server from client components.
// The client provides methods like:
//   - authClient.signUp.email()
//   - authClient.signIn.email()
//   - authClient.signIn.social()
//   - authClient.signOut()

import { createAuthClient } from "better-auth/client";
import { nextCookies } from "better-auth/next-js";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>(),
        nextCookies()  // Must be the last plugin
    ]
})