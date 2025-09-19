import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import SWRConfigProvider from "@/components/SWRConfigProvider";
import { SessionProvider } from "next-auth/react";

import { Toaster } from "@/components/ui/sonner";
import LoadingProvider from "@/components/LoadingProvider";

// hot start prisma sqlite + minio.

export const metadata: Metadata = {
  title: "临水创制 OR 游戏展示",
  description: "临水创制 OR 游戏展示，提供个人制作H5游戏的在线试玩和下载服务。",
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
        {/* Only for follow the theme of system */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SWRConfigProvider>
            <SessionProvider basePath={process.env.NEXT_PUBLIC_BASEPATH + "/api/auth"}>
              <LoadingProvider>
                {children}
              </LoadingProvider>
            </SessionProvider>
          </SWRConfigProvider>
          <Toaster
            richColors
            position="top-center"
            toastOptions={{ style: { fontFamily: "var(--default-font-family)" } }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
// 5 minute by default, only set for those page that need timing ISR.
// export const revalidate = 300;
