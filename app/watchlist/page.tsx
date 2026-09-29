import type { Metadata } from 'next';
import WatchlistClient from './watchlist-client';

export const metadata: Metadata = {
  title: 'My Watchlist - Cineby',
  description: 'Manage and keep track of all movies and TV shows you want to watch on Cineby.',
  alternates: {
    canonical: '/watchlist',
  },
};

export default function WatchlistPage() {
  return <WatchlistClient />;
}
