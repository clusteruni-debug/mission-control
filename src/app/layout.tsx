import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mission Control",
  description: "워크스페이스 프로젝트 관제 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className="min-h-screen bg-gray-50 font-sans antialiased dark:bg-gray-950"
      >
        {children}
      </body>
    </html>
  );
}
