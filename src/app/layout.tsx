import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Check-Eat - 성분은 꼼꼼하게, 성장은 바르게',
  description: '식품 라벨 분석으로 유해 성분을 확인하세요',
  manifest: '/manifest.json',
  themeColor: '#0d9488',
  appleWebApp: {
    statusBarStyle: 'default',
    title: 'Check-Eat',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
