import "@travel-with-me/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v9yf76d320.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
