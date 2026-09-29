import { Metadata } from 'next';
import { HistoryClient } from './history-client';

export const metadata: Metadata = {
  title: 'History',
  description: 'View your watch history and continue watching movies and TV shows from where you left off on Cineby.',
  alternates: {
    canonical: '/history',
  },
};

export default function HistoryPage() {
  return <HistoryClient />;
}
