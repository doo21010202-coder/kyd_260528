import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { KakaoMapScript } from "./kakao-map-script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "셔틀을 타보자",
  description: "셔틀버스 시간 조회 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Kakao Maps SDK가 미등록 도메인에서 alert를 띄우는 것 차단 */}
        <script dangerouslySetInnerHTML={{ __html: `
          var _a = window.alert;
          window.alert = function(m) {
            if (typeof m === 'string' && (m.includes('kakao') || m.includes('카카오') || m.includes('도메인'))) return;
            _a.call(window, m);
          };
        `}} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <KakaoMapScript />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
