'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { SearchBar } from '@/components/features/search-bar';
import { SettingsModal } from '@/components/features/settings-modal';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Detail pages have their own dedicated top controls
  const isDetailsPage = pathname?.startsWith('/movie/') || pathname?.startsWith('/tv/');
  if (isDetailsPage) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isMoviesActive = pathname === '/browse/movie' || pathname === '/movies';
  const isShowsActive = pathname === '/browse/tv' || pathname === '/shows';
  const isMyListActive = pathname === '/watchlist';

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-3.5 sm:top-5 md:top-6 left-0 w-full z-40 pointer-events-none px-3.5 sm:px-6 md:px-10">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Brand Logo on Top-Left */}
          <Link 
            href="/" 
            className="pointer-events-auto flex items-center gap-2 sm:gap-2.5 group transition-transform duration-200 active:scale-95 shrink-0"
          >
            <picture>
              <img 
                src="/logo.png" 
                alt="Cineby" 
                width={36} 
                height={36} 
                className="w-8 h-8 md:w-9 md:h-9 transition-transform duration-300 group-hover:scale-105" 
              />
            </picture>
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight drop-shadow-md">
              Cineby
            </span>
          </Link>

          {/* Desktop Floating Pill Navigation Dock (Apple TV Liquid Glass Style, Right-Aligned) */}
          <nav 
            className="pointer-events-auto hidden md:flex items-center bg-gradient-to-b from-white/[0.14] via-[#101115]/85 to-[#0b0c0e]/95 backdrop-blur-3xl saturate-150 border border-white/20 ring-1 ring-black/40 rounded-full p-1 sm:p-1.5 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.3),_inset_0_-1px_1px_rgba(0,0,0,0.5),_0_20px_50px_rgba(0,0,0,0.7),_0_2px_8px_rgba(0,0,0,0.4)] gap-0.5 sm:gap-1 select-none"
            aria-label="Desktop navigation"
          >
            {/* Home */}
            <Link
              href="/"
              className={cn(
                "rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 sm:gap-2",
                isHomeActive
                  ? "bg-gradient-to-b from-white via-zinc-100 to-zinc-200 text-zinc-950 px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),_inset_0_-1px_1px_rgba(0,0,0,0.15),_0_4px_16px_rgba(255,255,255,0.25),_0_2px_6px_rgba(0,0,0,0.3)] ring-1 ring-white/60 active:scale-95"
                  : "text-zinc-300 hover:text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 hover:bg-gradient-to-b hover:from-white/15 hover:to-white/5 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_2px_6px_rgba(0,0,0,0.25)] hover:ring-1 hover:ring-white/15 active:scale-95 font-medium"
              )}
            >
              {isHomeActive && <Icons.home className="w-4 h-4 stroke-[2.2]" />}
              <span>Home</span>
            </Link>

            {/* Movies */}
            <Link
              href="/browse/movie"
              className={cn(
                "rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 sm:gap-2",
                isMoviesActive
                  ? "bg-gradient-to-b from-white via-zinc-100 to-zinc-200 text-zinc-950 px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),_inset_0_-1px_1px_rgba(0,0,0,0.15),_0_4px_16px_rgba(255,255,255,0.25),_0_2px_6px_rgba(0,0,0,0.3)] ring-1 ring-white/60 active:scale-95"
                  : "text-zinc-300 hover:text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 hover:bg-gradient-to-b hover:from-white/15 hover:to-white/5 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_2px_6px_rgba(0,0,0,0.25)] hover:ring-1 hover:ring-white/15 active:scale-95 font-medium"
              )}
            >
              {isMoviesActive && <Icons.clapperboard className="w-4 h-4 stroke-[2.2]" />}
              <span>Movies</span>
            </Link>

            {/* Shows */}
            <Link
              href="/browse/tv"
              className={cn(
                "rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 sm:gap-2",
                isShowsActive
                  ? "bg-gradient-to-b from-white via-zinc-100 to-zinc-200 text-zinc-950 px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),_inset_0_-1px_1px_rgba(0,0,0,0.15),_0_4px_16px_rgba(255,255,255,0.25),_0_2px_6px_rgba(0,0,0,0.3)] ring-1 ring-white/60 active:scale-95"
                  : "text-zinc-300 hover:text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 hover:bg-gradient-to-b hover:from-white/15 hover:to-white/5 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_2px_6px_rgba(0,0,0,0.25)] hover:ring-1 hover:ring-white/15 active:scale-95 font-medium"
              )}
            >
              {isShowsActive && <Icons.tv className="w-4 h-4 stroke-[2.2]" />}
              <span>Shows</span>
            </Link>

            {/* My List */}
            <Link
              href="/watchlist"
              className={cn(
                "rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 sm:gap-2",
                isMyListActive
                  ? "bg-gradient-to-b from-white via-zinc-100 to-zinc-200 text-zinc-950 px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),_inset_0_-1px_1px_rgba(0,0,0,0.15),_0_4px_16px_rgba(255,255,255,0.25),_0_2px_6px_rgba(0,0,0,0.3)] ring-1 ring-white/60 active:scale-95"
                  : "text-zinc-300 hover:text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 hover:bg-gradient-to-b hover:from-white/15 hover:to-white/5 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_2px_6px_rgba(0,0,0,0.25)] hover:ring-1 hover:ring-white/15 active:scale-95 font-medium"
              )}
            >
              {isMyListActive && <Icons.bookmark className="w-4 h-4 stroke-[2.2]" />}
              <span>My List</span>
            </Link>

            {/* Refractive Liquid Glass Divider */}
            <div className="h-4 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent mx-0.5 sm:mx-1" />

            {/* Search Icon Trigger */}
            <SearchBar variant="pill" />

            {/* Settings Icon Trigger */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 sm:p-2 rounded-full text-zinc-300 hover:text-white hover:bg-gradient-to-b hover:from-white/15 hover:to-white/5 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] hover:ring-1 hover:ring-white/15 active:scale-90 transition-all duration-200 cursor-pointer flex items-center justify-center"
              title="Settings"
              aria-label="Settings"
            >
              <Icons.settings className="w-4 h-4 transition-colors" strokeWidth={2.2} />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Floating Apple TV Liquid Glass Navigation Dock (Standard App Width & Proportional Responsive Scaling) */}
      <nav
        className="md:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] h-[58px] sm:h-[62px] flex items-center justify-between px-2 sm:px-3 py-1.5 bg-[#111215]/90 backdrop-blur-3xl saturate-150 border border-white/[0.16] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.85),_inset_0_1px_1px_rgba(255,255,255,0.18)] select-none"
        aria-label="Mobile navigation"
      >
        {/* Home */}
        <Link
          href="/"
          className={cn(
            "transition-all duration-300 cursor-pointer select-none flex items-center justify-center shrink-0",
            isHomeActive
              ? "h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-gradient-to-b from-white via-[#fcfcfd] to-[#e4e5eb] text-zinc-950 shadow-[inset_0_1.5px_0_rgba(255,255,255,1),_inset_0_-1.5px_1px_rgba(0,0,0,0.18),_0_2px_8px_rgba(0,0,0,0.35)] border border-white/90 active:scale-95"
              : "w-10 h-10 sm:w-11 sm:h-11 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90"
          )}
          title="Home"
          aria-label="Home"
        >
          <Icons.home className={cn("transition-transform duration-200", isHomeActive ? "w-5 h-5 text-zinc-950 stroke-[2.3]" : "w-5 h-5 stroke-[2]")} />
        </Link>

        {/* Movies */}
        <Link
          href="/browse/movie"
          className={cn(
            "transition-all duration-300 cursor-pointer select-none flex items-center justify-center shrink-0",
            isMoviesActive
              ? "h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-gradient-to-b from-white via-[#fcfcfd] to-[#e4e5eb] text-zinc-950 shadow-[inset_0_1.5px_0_rgba(255,255,255,1),_inset_0_-1.5px_1px_rgba(0,0,0,0.18),_0_2px_8px_rgba(0,0,0,0.35)] border border-white/90 active:scale-95"
              : "w-10 h-10 sm:w-11 sm:h-11 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90"
          )}
          title="Movies"
          aria-label="Movies"
        >
          <Icons.clapperboard className={cn("transition-transform duration-200", isMoviesActive ? "w-5 h-5 text-zinc-950 stroke-[2.3]" : "w-5 h-5 stroke-[2]")} />
        </Link>

        {/* Shows */}
        <Link
          href="/browse/tv"
          className={cn(
            "transition-all duration-300 cursor-pointer select-none flex items-center justify-center shrink-0",
            isShowsActive
              ? "h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-gradient-to-b from-white via-[#fcfcfd] to-[#e4e5eb] text-zinc-950 shadow-[inset_0_1.5px_0_rgba(255,255,255,1),_inset_0_-1.5px_1px_rgba(0,0,0,0.18),_0_2px_8px_rgba(0,0,0,0.35)] border border-white/90 active:scale-95"
              : "w-10 h-10 sm:w-11 sm:h-11 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90"
          )}
          title="Shows"
          aria-label="Shows"
        >
          <Icons.tv className={cn("transition-transform duration-200", isShowsActive ? "w-5 h-5 text-zinc-950 stroke-[2.3]" : "w-5 h-5 stroke-[2]")} />
        </Link>

        {/* My List */}
        <Link
          href="/watchlist"
          className={cn(
            "transition-all duration-300 cursor-pointer select-none flex items-center justify-center shrink-0",
            isMyListActive
              ? "h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-gradient-to-b from-white via-[#fcfcfd] to-[#e4e5eb] text-zinc-950 shadow-[inset_0_1.5px_0_rgba(255,255,255,1),_inset_0_-1.5px_1px_rgba(0,0,0,0.18),_0_2px_8px_rgba(0,0,0,0.35)] border border-white/90 active:scale-95"
              : "w-10 h-10 sm:w-11 sm:h-11 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90"
          )}
          title="My List"
          aria-label="My List"
        >
          <Icons.bookmark className={cn("transition-transform duration-200", isMyListActive ? "w-5 h-5 text-zinc-950 stroke-[2.3]" : "w-5 h-5 stroke-[2]")} />
        </Link>

        {/* Refractive Liquid Glass Divider */}
        <div className="h-5 w-[1px] bg-gradient-to-b from-transparent via-white/25 to-transparent mx-0.5 shrink-0" />

        {/* Search */}
        <SearchBar 
          variant="pill" 
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90 flex items-center justify-center shrink-0" 
          iconClassName="w-5 h-5 stroke-[2]" 
        />

        {/* Settings */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
          title="Settings"
          aria-label="Settings"
        >
          <Icons.settings className="w-5 h-5 transition-colors stroke-[2]" />
        </button>
      </nav>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
