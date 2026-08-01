import type { NextConfig } from "next";

/**
 * BACKEND_URL is injected by Railway at build/runtime.
 * Locally it falls back to http://localhost:8000.
 *
 * Set this as a Railway variable:
 *   BACKEND_URL = https://<your-backend-service>.up.railway.app
 */
const BACKEND_URL = process.env.BACKEND_URL || "https://backend-production-946f.up.railway.app";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/api"],

  // Required for Railway Docker standalone deploy
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
