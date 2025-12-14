import type { NextConfig } from "next";

const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/firebase-messaging-sw.js',
                destination: '/api/firebase-sw',
            },
        ];
    },
};

export default nextConfig;
