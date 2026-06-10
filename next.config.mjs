/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
        authInterrupts: true,  // enables unauthorised and forbidden
    },
    // cacheComponents: true,
};

export default nextConfig;