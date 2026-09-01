'use client';

import { Icons } from '@/components/ui/icons';
import { triggerAdPopUp } from '@/lib/ad';

interface DownloadButtonProps {
  mediaId: string | number;
  type?: 'movie' | 'tv';
  season?: number;
  episode?: number;
  className?: string;
  label?: string;
  children?: React.ReactNode;
}

export function DownloadButton({ mediaId, type = 'movie', season, episode, className, label = 'Download', children }: DownloadButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    triggerAdPopUp();
    
    // Obfuscate the domain string to avoid simple string matching by bots
    const p1 = 'vid';
    const p2 = 'vault';
    const p3 = '.ru';
    let url = `https://${p1}${p2}${p3}/${type}/${mediaId}`;
    
    if (type === 'tv' && season !== undefined && episode !== undefined) {
      url += `/${season}/${episode}`;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className || "bg-zinc-800/80 border border-zinc-700/50 text-white font-medium text-[14px] md:text-[15px] w-[46px] h-[46px] sm:w-auto sm:h-auto sm:px-6 sm:py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 transition shrink-0"}
      title={label}
    >
      {children || (
        <>
          <Icons.download className="w-5 h-5" />
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
    </button>
  );
}
