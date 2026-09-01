import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { PlayerOverlay } from '@/components/features/player-overlay';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Cineby | Discover Movies & TV Shows',
  description: 'A comprehensive metadata discovery web application for movies and TV shows.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased min-h-screen`} suppressHydrationWarning>
        <Navbar />
        <Suspense fallback={null}>
          <PlayerOverlay />
        </Suspense>
        <main>
          {children}
        </main>
        <Footer />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}


