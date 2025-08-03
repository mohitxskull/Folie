import type { NextConfig } from "next";

import "./src/configs/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@folie/playground-backend"],
};

export default nextConfig;
