import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import "./globals.css";
import { SnackBarProvider } from "@/components/SnackBarContext";

export const metadata: Metadata = {
  title: "ZJU H5游戏中心",
  description: "浙江大学H5游戏中心，提供多款H5游戏的在线试玩和下载服务。",
  icons:{
    icon:  process.env.NEXT_PUBLIC_BASEPATH + "/favicon.ico",
  }
};

// import { Noto_Sans_SC } from 'next/font/google';
// const notoSansSC = Noto_Sans_SC({
//   weight: ['300', '400', '500', '700'],
//   subsets: ['latin', 'chinese-simplified'] as any,
//   display: 'swap',
//   adjustFontFallback: false,
//   variable: '--font-noto-sans-sc',
// });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // also use a query client provider
  return (
    <html lang="zh">
      <body>
        <AppRouterCacheProvider
          options={{ enableCssLayer: true, key: 'css', prepend: true }}
        >
          <ThemeProvider theme={theme}>
            <SnackBarProvider>{children}</SnackBarProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}


export const revalidate = 60; // 60 seconds revalidate, for server page (fast tourist page)