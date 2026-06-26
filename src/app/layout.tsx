import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Mate — AI 英语学习助手",
  description: "写作、翻译、AI 检查、智能笔记，全方位提升英语水平",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-white text-gray-900 antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
