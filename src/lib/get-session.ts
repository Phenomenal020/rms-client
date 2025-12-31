import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

export const getServerSession = cache(async () => {
  // retrieve the current user session on the server, use react cache to prevent duplicate requests read authentication headers from the next js requests, then return the user object if authenticated, otherwise null
  return await auth.api.getSession({ headers: await headers() });
});