import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow verification builds to run without overwriting an active development server.
  distDir: process.env.CMART_BUILD_DIR || ".next",
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
