import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "gateway.pinata.cloud",
            },
            {
                protocol: "https",
                hostname: "cyan-capable-elephant-108.mypinata.cloud",
            },
            {
                protocol: "https",
                hostname: "ipfs.io",
            },
            {
                protocol: "https",
                hostname: "cloudflare-ipfs.com",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
};

export default nextConfig;
