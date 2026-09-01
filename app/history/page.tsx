import { Metadata } from 'next';
import { HistoryClient } from './history-client';

export const metadata: Metadata = {
  title: 'Watch History - Cineby',
  description: 'View your watch history and continue watching movies and TV shows from where you left off.',
};

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
  return <HistoryClient />;
}
