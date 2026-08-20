import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve(__dirname),
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  // Optimize compilation with code splitting
  experimental: {
    optimizePackageImports: ['jspdf'],
  },
};

export default nextConfig;