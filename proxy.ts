import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {

    // get the pathname from the request
    const { pathname } = request.nextUrl;

    // check if the pathname is in the protected routes
    if(protectedRoutes.some(route => pathname.startsWith(route))) {
        // get the session cookie from the request
        const sessionCookie = request.cookies.get("better-auth.session_token");

        // if the session cookie is not found, redirect to the sign-in page
        if(!sessionCookie) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
    }

    // otherwise, continue to the next proxy
    return NextResponse.next();
}

const protectedRoutes = [
    "/classes",
    "/dashboard",
    "/enrollment",
    "/merge-requests",
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

// run for every request
// export const config = {
//     matcher: '/*',
// }