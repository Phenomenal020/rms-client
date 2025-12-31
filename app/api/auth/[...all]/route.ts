// This file sets up a route handler on the server to catch all auth requests

import { auth } from '@/src/lib/auth'
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth)