import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        const sessionCookie = request.cookies.get("better-auth.session_token");

        if (!sessionCookie) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
    }

    return NextResponse.next();
}

const protectedRoutes = [
    "/settings/profile",
    "/settings/school",
    "/settings/students",
    "/settings/subjects",
    "/view/results",
    "/view/subjects",
    "/view/results",
    "/templates/builtin",
    "/templates/custom",
]

export const config = {
    matcher: [
        "/settings/:path*",
        "/view/:path*",
        "/templates/:path*",
    ]
}