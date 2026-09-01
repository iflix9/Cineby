'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { getImageUrl } from '@/lib/tmdb';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { playMedia } from './player-overlay';
import { triggerAdPopUp } from '@/lib/ad';

interface EpisodesSectionProps {
  show: any;
  allSeasonsData: any[];
  seasonNum: string;
  episodeNum: string;
}

export function EpisodesSection({ show, allSeasonsData, seasonNum, episodeNum }: EpisodesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [activeSeason, setActiveSeason] = useState(Number(seasonNum) || 1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeSeasonData = useMemo(() => {
    return allSeasonsData?.find((s) => s && s.season_number === activeSeason);
  }, [allSeasonsData, activeSeason]);

  const filteredAndSortedEpisodes = useMemo(() => {
    if (!activeSeasonData?.episodes) return [];
    
    let result = [...activeSeasonData.episodes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((ep: any) => 
        ep.name.toLowerCase().includes(q) || 
        ep.overview.toLowerCase().includes(q)
      );
    }

    if (sortDesc) {
      result.reverse();
    }

    return result;
  }, [activeSeasonData, searchQuery, sortDesc]);

  // Make sure we only show valid seasons
  const validSeasons = show.seasons?.filter((s: any) => s.season_number > 0) || [];

  return (
    <div id="episodes" className="relative group scroll-mt-24 space-y-6">
      <h2 className="flex items-center gap-2.5 text-xl md:text-2xl font-bold text-white">
        <div className="w-1 h-5 md:h-6 bg-red-600 rounded-sm"></div>
        Episodes
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        {/* Season Dropdown */}
        <div className="relative z-20 min-w-[140px]">
          <button 
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-[#0f0f0f] border border-zinc-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center justify-between hover:bg-zinc-800/80 transition-colors"
          >
            <span>Season {activeSeason}</span>
            <Icons.chevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-2 w-full min-w-[160px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden origin-top z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
                  {validSeasons.map((s: any) => (
                    <button
                      key={s.id} 
                      onClick={() => {
                        setActiveSeason(s.season_number);
                        setIsDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-800 transition-colors ${activeSeason === s.season_number ? 'text-white bg-zinc-800 font-medium' : 'text-zinc-400'}`}
                    >
                      Season {s.season_number}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex items-center bg-[#0f0f0f] border border-zinc-800 px-4 py-2.5 rounded-xl flex-1 md:max-w-md transition-colors focus-within:border-zinc-500">
          <Icons.search className="w-4 h-4 text-zinc-500 absolute left-4" />
          <input 
            type="text" 
            placeholder="Search episode..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[16px] sm:text-sm text-zinc-300 w-full pl-7 placeholder:text-zinc-500"
          />
        </div>

        {/* Sort Button */}
        <button 
          onClick={() => setSortDesc(!sortDesc)}
          className="bg-[#0f0f0f] border border-zinc-800 text-zinc-400 p-2.5 rounded-xl hover:bg-zinc-800/80 hover:text-white transition-colors"
          title={sortDesc ? "Sort Oldest to Newest" : "Sort Newest to Oldest"}
        >
          {sortDesc ? <ArrowUpAZ className="w-5 h-5" /> : <ArrowDownAZ className="w-5 h-5" />}
        </button>
      </div>

      {/* Episodes List */}
      <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 md:pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
        {filteredAndSortedEpisodes.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 bg-[#0f0f0f] rounded-xl border border-zinc-800/50">
            No episodes found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredAndSortedEpisodes.map((ep: any) => {
            const isCurrent = seasonNum === ep.season_number.toString() && episodeNum === ep.episode_number.toString();
            
            const todayStr = new Date().toISOString().split("T")[0];
            const isReleased = ep.air_date ? ep.air_date <= todayStr : false;

            const cardContent = (
              <>
                <div className="relative w-full sm:w-52 shrink-0 aspect-video bg-neutral-900 rounded-lg overflow-hidden">
                  {ep.still_path || show.backdrop_path ? (
                    <Image 
                      src={getImageUrl(ep.still_path || show.backdrop_path, 'w500')}
                      alt={ep.name}
                      fill
                      className={`object-cover transition-transform duration-300 ${isReleased ? 'group-hover/ep:scale-105' : ''}`}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-zinc-800 text-xs">No Image</div>
                  )}
                  
                  {/* Episode Number Badge on bottom-left of thumbnail */}
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-white font-bold z-10 border border-white/10 shadow-sm">
                    {ep.episode_number}
                  </div>

                  {!isReleased ? (
                    <div className="absolute inset-0 bg-zinc-950/80 flex flex-col items-center justify-center text-center p-2 z-10 backdrop-blur-[2px]">
                      <span className="text-white font-bold text-[11px] md:text-xs tracking-wider uppercase mb-1">Coming Soon</span>
                      {ep.air_date && (
                        <span className="text-red-500 font-semibold text-xs">{new Date(ep.air_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/20 group-hover/ep:bg-black/40 transition-colors flex items-center justify-center z-10">
                      <Icons.play className="w-8 h-8 text-white fill-white opacity-0 group-hover/ep:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                  <h4 className={`font-semibold text-base sm:text-lg leading-snug truncate transition-colors duration-200 ${isCurrent ? 'text-white group-hover/ep:text-red-500' : (isReleased ? 'text-neutral-100 group-hover/ep:text-red-500' : 'text-neutral-500')}`}>
                    {ep.name}
                  </h4>
                  
                  {ep.runtime > 0 && isReleased && (
                    <div className="text-xs sm:text-sm text-neutral-400 font-normal my-1">
                      {ep.runtime} min
                    </div>
                  )}

                  <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${ep.runtime ? 'mt-0' : 'mt-1'} ${isReleased ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {ep.overview || 'No description available.'}
                  </p>
                </div>

                {/* Minimalist Download Icon Button on far right */}
                {isReleased && (
                  <div className="flex items-center shrink-0 self-center pl-1 sm:pl-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerAdPopUp();
                        const p1 = 'vid';
                        const p2 = 'vault';
                        const p3 = '.ru';
                        window.open(`https://${p1}${p2}${p3}/tv/${show.id}/${ep.season_number}/${ep.episode_number}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="p-2.5 sm:p-3 rounded-full hover:bg-zinc-800/80 border border-transparent hover:border-red-500/50 text-neutral-400 hover:text-red-500 transition-all cursor-pointer group/dl"
                      title={`Download S${ep.season_number} E${ep.episode_number}`}
                      aria-label={`Download S${ep.season_number} E${ep.episode_number}`}
                    >
                      <Icons.download className="w-5 h-5 text-neutral-400 group-hover/dl:text-red-500 transition-colors" />
                    </button>
                  </div>
                )}
              </>
            );

            const cardClasses = `w-full text-left flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 sm:p-4 rounded-xl transition-all group/ep relative ${
              isCurrent ? 'bg-zinc-800/90 border border-zinc-700 shadow-md' : 
              isReleased ? 'bg-[#0f0f11] hover:bg-zinc-900/90 border border-zinc-800/60 hover:border-zinc-700/60 cursor-pointer' : 
              'bg-[#0a0a0b] border border-zinc-900/60 opacity-70 cursor-default'
            }`;

            return isReleased ? (
              <div
                role="button"
                tabIndex={0}
                key={ep.id}
                onClick={(e) => {
                  e.preventDefault();
                  triggerAdPopUp();
                  import('./player-overlay').then(({ playMedia }) => {
                    playMedia('tv', show.id.toString(), ep.season_number, ep.episode_number);
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerAdPopUp();
                    import('./player-overlay').then(({ playMedia }) => {
                      playMedia('tv', show.id.toString(), ep.season_number, ep.episode_number);
                    });
                  }
                }}
                className={cardClasses}
              >
                {cardContent}
              </div>
            ) : (
              <div key={ep.id} className={cardClasses}>
                {cardContent}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
