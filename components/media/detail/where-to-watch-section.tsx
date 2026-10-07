'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/tmdb';
import { Icons } from '@/components/ui/icons';

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WhereToWatchSectionProps {
  providers: any;
  className?: string;
}

export function WhereToWatchSection({ providers, className = '' }: WhereToWatchSectionProps) {
  const [activeTab, setActiveTab] = useState<'stream' | 'rent' | 'buy'>('stream');

  if (!providers || !providers.results) {
    return null;
  }

  // Fallback to US if available, or try to find any country with streaming/rent/buy data
  let countryCode = 'US';
  if (!providers.results[countryCode] && Object.keys(providers.results).length > 0) {
    const fallbackCountry = Object.keys(providers.results).find(
      (code) => providers.results[code]?.flatrate || providers.results[code]?.rent || providers.results[code]?.buy
    );
    if (fallbackCountry) {
      countryCode = fallbackCountry;
    }
  }

  const countryData = providers.results[countryCode];
  if (!countryData) {
    return null;
  }

  const streamList: Provider[] = countryData.flatrate || [];
  const rentList: Provider[] = countryData.rent || [];
  const buyList: Provider[] = countryData.buy || [];

  const hasStream = streamList.length > 0;
  const hasRent = rentList.length > 0;
  const hasBuy = buyList.length > 0;

  if (!hasStream && !hasRent && !hasBuy) {
    return null;
  }

  // Set default tab to first available
  const currentList =
    activeTab === 'stream' && hasStream
      ? streamList
      : activeTab === 'rent' && hasRent
      ? rentList
      : activeTab === 'buy' && hasBuy
      ? buyList
      : hasStream
      ? streamList
      : hasRent
      ? rentList
      : buyList;

  return (
    <div className={`w-full bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <Icons.tv className="w-5 h-5 text-red-500" />
            <span>Where to Watch</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Official streaming, rental, and purchase platforms</p>
        </div>

        {/* Option Tabs */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-full border border-white/5 shrink-0 self-start sm:self-auto">
          {hasStream && (
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'stream'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Stream ({streamList.length})
            </button>
          )}
          {hasRent && (
            <button
              onClick={() => setActiveTab('rent')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'rent'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Rent ({rentList.length})
            </button>
          )}
          {hasBuy && (
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'buy'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Buy ({buyList.length})
            </button>
          )}
        </div>
      </div>

      {/* Provider Badges Grid */}
      <div className="pt-4 flex flex-wrap items-center gap-3 md:gap-4">
        {currentList.map((p) => (
          <div
            key={p.provider_id}
            className="flex items-center gap-2.5 bg-black/30 hover:bg-black/50 border border-white/10 hover:border-white/20 transition-all duration-200 rounded-xl px-3 py-2 shrink-0 group"
            title={p.provider_name}
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
              <Image
                src={getImageUrl(p.logo_path, 'original')}
                alt={p.provider_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
            <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
              {p.provider_name}
            </span>
          </div>
        ))}
      </div>

      {/* JustWatch Attribution */}
      {countryData.link && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
          <span>Region: {countryCode}</span>
          <a
            href={countryData.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors group"
          >
            <span>Powered by JustWatch</span>
            <Icons.externalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      )}
    </div>
  );
}
