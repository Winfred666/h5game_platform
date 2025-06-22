import type { NextConfig } from "next";

// if deploy on Vercel,
function extractBasePath(frontUrl?: string): string {
  // 处理未定义或空值的情况
  if (!frontUrl || frontUrl.trim() === "") {
    return "";
  }
  const urlObj = new URL(frontUrl);
  let basePath = urlObj.pathname;
  // 移除末尾的斜杠（如果有）
  if (basePath.endsWith("/")) {
    basePath = basePath.slice(0, -1);
  }
  return basePath;
}

process.env.NEXT_PUBLIC_BASEPATH = extractBasePath(
  process.env.NEXT_PUBLIC_FRONT_URL
);

const nextConfig: NextConfig = {
  /* images is used for next.js server to fetch image from remote and cache for optimized */
  images: {
    remotePatterns: [
      new URL(process.env.NEXT_PUBLIC_MINIO_URL || "")
    ],
  },
  output: "standalone",
  basePath: process.env.NEXT_PUBLIC_BASEPATH,
};

export default nextConfig;
