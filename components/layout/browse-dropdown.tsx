'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function BrowseDropdown({ isMobile }: { isMobile?: boolean }) {
  const [adsStatus, setAdsStatus] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (!target.closest('[data-browse-trigger]')) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const trigger = isMobile ? (
    <div 
      data-browse-trigger
      className={`relative flex flex-col items-center justify-center w-12 h-11 bg-[#050505] rounded-xl transition-colors duration-200 shadow-sm cursor-pointer ${isOpen ? 'text-[#ff3333]' : 'text-zinc-300 hover:text-white'}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <Icons.layoutGrid className={`w-5 h-5 ${isOpen ? 'mb-1' : ''}`} />
      {isOpen && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#ff3333]"></span>}
    </div>
  ) : (
    <div 
      data-browse-trigger
      className={`px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2 ${isOpen ? 'text-red-500 bg-zinc-800/50' : 'text-zinc-300 hover:text-red-500 hover:bg-zinc-800/50'}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <Icons.layoutGrid className="w-5 h-5 transition-colors duration-200" />
      <span className="hidden sm:inline transition-colors duration-200">Browse</span>
      <Icons.chevronDown className={`w-4 h-4 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </div>
  );

  const menuContent = (
    <div className={`transition-all duration-200 ease-out z-50 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'} ${isMobile ? 'fixed bottom-24 left-1/2 -translate-x-1/2 w-[320px]' : 'absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[280px]'}`}>
      <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl shadow-2xl" ref={isMobile ? dropdownRef : null}>
        <div className="p-3 border-b border-zinc-800">
          <h3 className="text-white font-bold text-sm text-center">Browse</h3>
        </div>
        <div className="p-4">
          <div className="mb-5">
            <h4 className="text-zinc-500 text-[10px] font-semibold tracking-wider mb-3 uppercase">Content</h4>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/browse/movie" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1.5 group/item">
                <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-[#161616] flex items-center justify-center group-hover/item:border-red-500/50 transition-colors">
                  <Icons.clapperboard className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-[10px] font-medium text-zinc-300 group-hover/item:text-white">Movies</span>
              </Link>
              <Link href="/browse/tv" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1.5 group/item">
                <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-[#161616] flex items-center justify-center group-hover/item:border-red-500/50 transition-colors">
                  <Icons.tv className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-[10px] font-medium text-zinc-300 group-hover/item:text-white">TV Shows</span>
              </Link>
              <Link href="/browse/anime" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1.5 group/item">
                <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-[#161616] flex items-center justify-center group-hover/item:border-red-500/50 transition-colors">
                  <Icons.pinwheel className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-[10px] font-medium text-zinc-300 group-hover/item:text-white">Anime</span>
              </Link>
            </div>
          </div>
          <div className="mb-5">
            <h4 className="text-zinc-500 text-[10px] font-semibold tracking-wider mb-3 uppercase">Features</h4>
            <div className="grid grid-cols-3 gap-2">
              <Link href="#" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1.5 group/item">
                <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-[#161616] flex items-center justify-center group-hover/item:border-blue-500/50 transition-colors">
                  <Icons.audioLines className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[10px] font-medium text-zinc-300 group-hover/item:text-white">Channels</span>
              </Link>
              <Link href="#" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1.5 group/item">
                <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-[#161616] flex items-center justify-center group-hover/item:border-purple-500/50 transition-colors">
                  <Icons.projector className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-[10px] font-medium text-zinc-300 group-hover/item:text-white">4K</span>
              </Link>
              <Link href="#" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1.5 group/item">
                <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-[#161616] flex items-center justify-center group-hover/item:border-yellow-500/50 transition-colors">
                  <Icons.partyPopper className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-[10px] font-medium text-zinc-300 group-hover/item:text-white text-center leading-tight">Watch Party</span>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-zinc-500 text-[10px] font-semibold tracking-wider mb-3 uppercase">Personal</h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Link href="/history" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center py-3 rounded-xl border border-zinc-800 bg-[#161616] hover:bg-zinc-800/50 hover:border-red-500/50 transition-colors group/item">
                <Icons.library className="w-5 h-5 text-zinc-400 mb-1 group-hover/item:text-red-500 transition-colors" />
                <span className="text-[11px] font-medium text-zinc-300 group-hover/item:text-red-500 transition-colors">History</span>
              </Link>
              <Link href="/watchlist" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center py-3 rounded-xl border border-zinc-800 bg-[#161616] hover:bg-zinc-800/50 hover:border-red-500/50 transition-colors group/item">
                <Icons.heart className="w-5 h-5 text-zinc-400 mb-1 group-hover/item:text-red-500 transition-colors" />
                <span className="text-[11px] font-medium text-zinc-300 group-hover/item:text-red-500 transition-colors">Watchlist</span>
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-[#161616]">
              <div className="flex items-center gap-2">
                <Icons.slidersHorizontal className="w-4 h-4 text-zinc-400" />
                <span className="text-[11px] font-medium text-zinc-300">Ads status</span>
              </div>
              <button
                onClick={() => setAdsStatus(!adsStatus)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${adsStatus ? 'bg-red-600' : 'bg-zinc-700'}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${adsStatus ? 'translate-x-5' : 'translate-x-1'}`}
                />
                {adsStatus && <span className="absolute left-1.5 text-[8px] font-bold text-white">ON</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={isMobile ? "" : "relative"} ref={isMobile ? null : dropdownRef}>
      {trigger}
      {isMobile ? mounted && createPortal(menuContent, document.body) : menuContent}
    </div>
  );
}
