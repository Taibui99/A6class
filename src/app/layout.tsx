import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SplashScreen } from "@/components/layout/splash-screen";

export const metadata: Metadata = {
  title: "A6Class — Ngôi nhà số của lớp 12A6",
  description:
    "Nền tảng quản lý lớp học, thi đua, nhiệm vụ và giao tiếp cho lớp 12A6",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAF9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Chuyển đến nội dung chính
        </a>
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
