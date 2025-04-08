import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

// import { Noto_Sans_SC } from 'next/font/google';
// const notoSansSC = Noto_Sans_SC({
//   weight: ['300', '400', '500', '700'],
//   subsets: ['latin', 'chinese-simplified'] as any,
//   display: 'swap',
//   adjustFontFallback: false,
//   variable: '--font-noto-sans-sc',
// });

export const metadata: Metadata = {
  title: "ZJU H5游戏中心",
  description: "浙江大学H5游戏中心，提供多款H5游戏的在线试玩和下载服务。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <NavBar />
            {children}
            <Footer />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
