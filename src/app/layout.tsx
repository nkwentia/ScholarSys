import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

// 1. Next.js 14 standard metadata (without themeColor)
export const metadata: Metadata = {
  title: 'SchoolMan — School Management System',
  description: 'Modern school administration: finance, grades, timetabling, offline-first.',
  manifest: '/manifest.json',
};

// 2. Separate Viewport configuration to eliminate the console warning
export const viewport: Viewport = {
  themeColor: '#1e3a5f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}