import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
function hasBetterAuthSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(({ name }) =>
    name === 'better-auth.session_token' ||
    name === '__Secure-better-auth.session_token' ||
    name.startsWith('better-auth.session_token.') ||
    name.startsWith('__Secure-better-auth.session_token.'),
  );
}

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  // get the pathname from the request
  const { pathname } = request.nextUrl;

  // check if the pathname is in the protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!hasBetterAuthSessionCookie(request)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }
}

// otherwise, continue to the next proxy

const protectedRoutes = [
  "/classes",
  "/dashboard",
  "/enrollment",
  "/merge-requests",
  "/onboarding",
  "/profile",
  "/school",
  "/spreadsheet-view",
  "/students",
  "/subjects",
  "/subject-view",
  "/teachers",
  "/templates",
  "/term",
  "/upload-requests",
  "/students-view"
]

