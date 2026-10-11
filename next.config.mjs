/** @type {import('next').NextConfig} */

const apiUpstream = process.env.API_UPSTREAM_URL?.replace(/\/+$/, '');

const nextConfig = {
    experimental: {
        authInterrupts: true,  // enables unauthorised and forbidden
    },
    // cacheComponents: true,
    async rewrites() {
        if (!apiUpstream) return [];
        return [
            {
                source: '/api/:path*',
                destination: `${apiUpstream}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;