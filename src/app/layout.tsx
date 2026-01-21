import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/Header";
import { PresenceProvider } from "@/context/PresenceContext";
import { AlertProvider } from "@/context/AlertContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cal-Link",
  description: "날짜를 연결하고 채팅으로 기록하는 나만의 타임라인",
  icons: {
    icon: "/favicon.ico", // public 폴더의 파일 경로
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased bg-[#FFFBF5]`}>
        <PresenceProvider>
          <AlertProvider>
            {/* 모든 페이지 상단에 고정되는 헤더 */}
            <Header />

            {/* 페이지별 컨텐츠 */}
            <div className="relative pt-[80px]">
              {/* 헤더 높이만큼 padding-top을 주어 컨텐츠가 가려지지 않게 합니다 */}
              {children}
            </div>
          </AlertProvider>
        </PresenceProvider>
      </body>
    </html>
  );
}
