import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SkyCast — Aplikasi Cuaca Cerdas',
  description: 'Aplikasi cuaca cerdas dengan saran personal dari AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}