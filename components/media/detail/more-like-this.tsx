'use client';

import { MediaCarousel } from '@/components/features/media-carousel';
import { Media } from '@/types/tmdb';

interface MoreLikeThisSectionProps {
  items: Media[];
  title?: string;
  className?: string;
}

export function MoreLikeThisSection({
  items,
  title = 'More Like This',
  className = '',
}: MoreLikeThisSectionProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div id="similar" className={`relative scroll-mt-24 ${className}`}>
      <MediaCarousel title={title} items={items} />
    </div>
  );
}
