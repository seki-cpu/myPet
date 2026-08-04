import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PawMatch 趣味测试',
  description: '如果你是狗狗，你会是哪种犬种？',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
