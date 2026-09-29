import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cineby - Free Movies & TV Shows',
    short_name: 'Cineby',
    description: 'Cineby is your ultimate cinematic database. Discover, explore, and track movies and TV shows.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo.png',
        sizes: '80x80',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
