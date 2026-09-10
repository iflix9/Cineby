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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cinebyfree.co'),
  applicationName: 'Cineby',
  appleWebApp: {
    title: 'Cineby',
    statusBarStyle: 'default',
    capable: true,
  },
  title: {
    default: 'Cineby - Free Movies and TV Shows Database',
    template: '%s - Cineby'
  },
  description: 'Cineby is your ultimate cinematic database. Discover, explore, and track your favorite movies, TV shows, cast details, and more.',
  keywords: ['Cineby', 'movies', 'TV shows', 'cinema', 'database', 'streaming', 'film', 'metadata', 'actors', 'series'],
  authors: [{ name: 'Cineby' }],
  creator: 'Cineby',
  publisher: 'Cineby',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: {
      default: 'Cineby - Free Movies and TV Shows Database',
      template: '%s - Cineby'
    },
    description: 'Cineby is your ultimate cinematic database. Discover, explore, and track your favorite movies, TV shows, and cast details.',
    siteName: 'Cineby',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: 'Cineby - Free Movies and TV Shows Database',
      template: '%s - Cineby'
    },
    description: 'Discover and explore movies, TV shows, and cast details on Cineby.',
    creator: '@cineby',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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


