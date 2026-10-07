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

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith('http'))
  ? process.env.NEXT_PUBLIC_SITE_URL
  : 'https://www.cinebyfree.co';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Cineby',
  appleWebApp: {
    title: 'Cineby',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
  title: {
    default: 'Cineby – Streaming Guide, Watch Trailers & Movie Discovery',
    template: '%s | Cineby',
  },
  description: 'Cineby is your ultimate cinematic streaming guide. Discover where to stream movies and TV shows, watch official trailers, explore ratings, cast, and trending releases.',
  keywords: [
    'Cineby',
    'Cineby streaming guide',
    'where to watch movies',
    'movie streaming guide',
    'tv show streaming guide',
    'watch trailers online',
    'official movie trailers',
    'streaming finder',
    'what to watch',
    'trending movies',
    'popular TV shows',
    'cinema guide',
    'film guide',
    'entertainment guide',
  ],
  authors: [{ name: 'Cineby', url: siteUrl }],
  creator: 'Cineby',
  publisher: 'Cineby',
  verification: {
    google: 'google889937a54e106376',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: {
      default: 'Cineby – Streaming Guide, Watch Trailers & Movie Discovery',
      template: '%s | Cineby',
    },
    description: 'Cineby is your ultimate cinematic streaming guide. Discover where to stream movies and TV shows, watch official trailers, explore ratings, cast, and trending releases.',
    siteName: 'Cineby',
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 80,
        height: 80,
        alt: 'Cineby Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: 'Cineby – Streaming Guide, Watch Trailers & Movie Discovery',
      template: '%s | Cineby',
    },
    description: 'Find where to stream movies and TV shows, watch official trailers, and track trending releases on Cineby.',
    creator: '@cineby',
    site: '@cineby',
    images: [`${siteUrl}/logo.png`],
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

const brandSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Cineby',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      sameAs: [
        'https://twitter.com/cineby',
        process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/Z6DCPzgJ9a',
      ],
      description: 'Cineby is the ultimate cinematic streaming guide and entertainment discovery platform.',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Cineby',
      alternateName: ['Cineby Streaming Guide', 'Cineby TV', 'Cineby Stream', 'Cineby Watch'],
      description: 'The ultimate streaming guide to discover where to watch movies, series, and trailers.',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased min-h-screen`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
        />
        <Navbar />
        <Suspense fallback={null}>
          <PlayerOverlay />
        </Suspense>
        <main>
          {children}
        </main>
        {modal}
        <Footer />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
