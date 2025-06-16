import type { NextConfig } from "next";

function extractBasePath(frontUrl?:string):string {
  try {
    // 处理未定义或空值的情况
    if (!frontUrl || frontUrl.trim() === '') {
      return '';
    }
    const urlObj = new URL(frontUrl);
    let basePath = urlObj.pathname;
    // 移除末尾的斜杠（如果有）
    if (basePath.endsWith('/')) {
      basePath = basePath.slice(0, -1);
    }
    
    return basePath;
  } catch (error) {
    console.error("Invalid PUBLIC_FRONT_URL:", frontUrl, error);
    return '';
  }
}

process.env.NEXT_PUBLIC_BASEPATH = extractBasePath(process.env.NEXT_PUBLIC_URL);

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",    // 协议（本地开发通常用 HTTP）
        hostname: "localhost",  // 主机名
        port: "",           // 端口（空字符串表示允许所有端口）
        pathname: "/**",    // 路径（允许所有子路径）
      },
    ],
    unoptimized: true, // 禁用 Next.js 的图像优化
  },
  output: "standalone",
  basePath:process.env.NEXT_PUBLIC_BASEPATH,
};

export default nextConfig;
