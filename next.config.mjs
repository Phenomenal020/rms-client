/** @type {import('next').NextConfig} */

// Browser calls https://teachersaid.tech/api/… (same origin). Vercel forwards to Cloud Run.
const apiUpstream = (process.env.API_UPSTREAM_URL || "http://localhost:5000").replace(/\/+$/, "");
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// skip api proxy for local development
const useApiProxy =
    !publicApiUrl.includes("localhost") && Boolean(process.env.API_UPSTREAM_URL);

// 
const nextConfig = {
    experimental: {
        authInterrupts: true,  // enables unauthorised and forbidden
    },
    async rewrites() {
        if (!useApiProxy) {
            return [];
        }
        return [
            {
                source: "/api/:path*",
                destination: `${apiUpstream}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;