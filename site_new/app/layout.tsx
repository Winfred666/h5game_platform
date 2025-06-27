import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import SWRConfigProvider from "@/components/SWRConfigProvider";

// hot start prisma sqlite + minio.

export const metadata: Metadata = {
  title: "ZJU H5游戏中心",
  description: "浙江大学H5游戏中心，提供多款H5游戏的在线试玩和下载服务。",
  icons: {
    icon: process.env.NEXT_PUBLIC_BASEPATH + "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SWRConfigProvider>{children}</SWRConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const revalidate = 300; // 5 minute
