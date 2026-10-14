import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ponytail: classic prerender model — cacheComponents' strict fetch rules fight
  // static prerendering; re-enable if PPR/streaming is ever actually needed.
  cacheComponents: false,
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
