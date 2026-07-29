import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/api", "@repo/ui"],
  output: "standalone",
};

export default nextConfig;
