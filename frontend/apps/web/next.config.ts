import type { NextConfig } from "next";

/**
 * BACKEND_URL is injected by Railway at build/runtime.
 * Locally it falls back to http://localhost:8000.
 *
 * Set this as a Railway variable:
 *   BACKEND_URL = https://<your-backend-service>.up.railway.app
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/api", "@repo/ui"],

  // Required for Railway Docker standalone deploy
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
