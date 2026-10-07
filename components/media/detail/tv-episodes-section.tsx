'use client';

import { EpisodesSection } from '@/components/features/episodes-section';

interface TVEpisodesSectionProps {
  show: any;
  allSeasonsData: any[];
  seasonNum: string;
  episodeNum: string;
  className?: string;
}

export function TVEpisodesSection({
  show,
  allSeasonsData,
  seasonNum,
  episodeNum,
  className = '',
}: TVEpisodesSectionProps) {
  if (!show || !show.seasons || show.seasons.filter((s: any) => s.season_number > 0).length === 0) {
    return null;
  }

  return (
    <div id="episodes" className={`relative scroll-mt-24 ${className}`}>
      <EpisodesSection
        show={show}
        allSeasonsData={allSeasonsData}
        seasonNum={seasonNum}
        episodeNum={episodeNum}
      />
    </div>
  );
}
