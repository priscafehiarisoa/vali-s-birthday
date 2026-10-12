import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ["@libsql/client"],
  // The schema is read at runtime, make sure Vercel ships it with the API routes
  outputFileTracingIncludes: {
    "/api/**": ["./data/schema.sql"],
  },
  // Lets you test the dev server from a phone on the same Wi-Fi
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
