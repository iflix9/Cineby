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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinebyfree.co';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Cineby',
  appleWebApp: {
    title: 'Cineby',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
  title: {
    default: 'Cineby - Watch Free Movies & TV Shows Online',
    template: '%s | Cineby'
  },
  description: 'Cineby is the leading free movies and TV shows database. Discover, explore, and track thousands of trending movies, series, anime, and trailers on Cineby.',
  keywords: [
    'Cineby',
    'Cineby movies',
    'Cineby free',
    'Cineby TV',
    'Cineby streaming',
    'Cineby app',
    'Cineby watch movies',
    'Cineby official',
    'watch free movies online',
    'free TV shows',
    'movie database',
    'anime streaming database',
    'cinema trailers',
    'film metadata'
  ],
  authors: [{ name: 'Cineby', url: siteUrl }],
  creator: 'Cineby',
  publisher: 'Cineby',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: {
      default: 'Cineby - Watch Free Movies & TV Shows Online',
      template: '%s | Cineby'
    },
    description: 'Cineby is the leading free movies and TV shows database. Discover, explore, and track thousands of trending movies, series, anime, and trailers on Cineby.',
    siteName: 'Cineby',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Cineby Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: 'Cineby - Watch Free Movies & TV Shows Online',
      template: '%s | Cineby'
    },
    description: 'Discover and explore movies, TV shows, and cast details on Cineby.',
    creator: '@cineby',
    site: '@cineby',
    images: ['/logo.png'],
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
        'https://discord.gg/cineby'
      ],
      description: 'Cineby is a free movies, TV shows, and anime metadata discovery platform.',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Cineby',
      alternateName: ['Cineby Free Movies', 'Cineby TV', 'Cineby Stream', 'Cineby App'],
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/browse/movie?query={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#webapp`,
      name: 'Cineby',
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      url: siteUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
        />
      </head>
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


