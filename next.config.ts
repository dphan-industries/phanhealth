import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  experimental: { agentFeedback: true },
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [{ source: "/games/move-the-moon", destination: "/games/move-the-moon/index.html" }];
  },
};
export default nextConfig;
