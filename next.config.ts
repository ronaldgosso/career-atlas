import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  // Optimize compilation with code splitting
  experimental: {
    optimizePackageImports: ['@huggingface/inference', 'jspdf'],
  },
};

export default nextConfig;