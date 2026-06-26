import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // bcryptjs 需要 Node.js API，Vercel Edge 环境不支持
  serverExternalPackages: ["bcryptjs"],
};

export default nextConfig;
