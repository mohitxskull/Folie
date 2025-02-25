import type { NextConfig } from "next";

import "./src/configs/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@folie/service-formation-backend"],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
      ".cjs": [".cts", ".cjs"],
    };
    return config;
  },
};

export default nextConfig;
