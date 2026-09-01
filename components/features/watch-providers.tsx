import Image from 'next/image';
import { getImageUrl } from '@/lib/tmdb';

interface WatchProvidersProps {
  providers: any;
}

export function WatchProviders({ providers }: WatchProvidersProps) {
  if (!providers || !providers.results) {
    return null;
  }

  // Fallback to US if available, or try to find any country with flatrate (streaming)
  let countryCode = 'US';
  if (!providers.results[countryCode] && Object.keys(providers.results).length > 0) {
    // find the first country that has flatrate
    const fallbackCountry = Object.keys(providers.results).find(code => providers.results[code]?.flatrate);
    if (fallbackCountry) {
        countryCode = fallbackCountry;
    }
  }

  const countryData = providers.results[countryCode];
  
  if (!countryData || !countryData.flatrate || countryData.flatrate.length === 0) {
    return null;
  }

  const streamingProviders = countryData.flatrate;

  return (
    <div className="flex items-center gap-3 mt-5">
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Available on:
      </span>
      <div className="flex items-center gap-2">
        {streamingProviders.slice(0, 5).map((p: any) => (
          <div 
            key={p.provider_id} 
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg overflow-hidden relative border border-zinc-800/80 shadow-sm" 
            title={p.provider_name}
          >
            <Image 
              src={getImageUrl(p.logo_path, 'original')} 
              alt={p.provider_name} 
              fill 
              className="object-cover" 
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
