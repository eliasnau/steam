import "@repo/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
  },
  cacheComponents: true,
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
