'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { Media, TMDBResponse } from '@/types/tmdb';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import { playMedia } from './player-overlay';
import { triggerAdPopUp } from '@/lib/ad';

export function SearchBar({ isMobile }: { isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<'multi' | 'movie' | 'tv' | 'anime'>('multi');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const addToRecent = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t !== term.trim());
      const updated = [term.trim(), ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Close search when pressing escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Fetch results when debounced query or searchType changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    setHasMore(false);
    setResults([]);
  }, [debouncedQuery, searchType]);

  useEffect(() => {
    if (debouncedQuery.trim() === '') {
      return;
    }

    let isMounted = true;
    const fetchResults = async () => {
      if (page === 1) setIsLoading(true);
      try {
        let endpoint = `/api/tmdb/search/${searchType === 'anime' ? 'multi' : searchType}`;
        const response = await fetch(`${endpoint}?query=${encodeURIComponent(debouncedQuery)}&include_adult=false&page=${page}`);
        if (response.ok && isMounted) {
          const data = await response.json();
          // Filter out people from multi search and ensure they have a poster
          let newResults = data.results.filter((r: any) => r.media_type !== 'person' && r.poster_path);
          
          if (searchType === 'anime') {
             // Basic filter for anime (animation genre 16, or original language ja)
             newResults = newResults.filter((r: any) => 
               (r.genre_ids?.includes(16) || r.original_language === 'ja')
             );
          }
          
          setResults(prev => page === 1 ? newResults : [...prev, ...newResults]);
          setHasMore(data.page < data.total_pages);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        if (isMounted && page === 1) setIsLoading(false);
      }
    };

    fetchResults();
    return () => { isMounted = false; };
  }, [debouncedQuery, page, searchType]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
  };

  const handleLinkClick = () => {
    if (query.trim()) {
      addToRecent(query);
    }
    closeSearch();
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      addToRecent(query);
    }
  };

  // Close when clicking outside the modal content
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSearch();
    }
  };

  return (
    <>
      <button 
        onClick={openSearch}
        className={isMobile
          ? `relative flex flex-col items-center justify-center w-12 h-11 bg-[#050505] rounded-xl transition-colors duration-200 shadow-sm cursor-pointer ${isOpen ? 'text-[#ff3333]' : 'text-zinc-300 hover:text-white'}`
          : `px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${isOpen ? 'text-red-500 bg-zinc-800/50' : 'text-zinc-300 hover:text-red-500 hover:bg-zinc-800/50'}`}
        aria-label="Open search"
      >
        <Icons.search className={`w-5 h-5 transition-colors duration-200 ${isMobile && isOpen ? 'mb-1' : ''}`} strokeWidth={2.5} />
        {isMobile && isOpen && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#ff3333]"></span>}
      </button>

      {mounted && isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div 
            ref={containerRef}
            className="w-full max-w-2xl bg-transparent flex flex-col gap-4 animate-in fade-in zoom-in duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Search</h2>
              <div className="flex items-center gap-2">
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 bg-[#0a0a0a] border border-zinc-800/60 rounded-xl px-3 py-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    {searchType === 'multi' && 'Movies & TV Shows'}
                    {searchType === 'movie' && 'Movies'}
                    {searchType === 'tv' && 'TV Shows'}
                    {searchType === 'anime' && 'Animes'}
                    <Icons.chevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0a] border border-zinc-800/60 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="flex flex-col">
                        <button 
                          onClick={() => { setSearchType('multi'); setIsDropdownOpen(false); }}
                          className={`text-left px-4 py-2.5 text-sm transition-colors hover:bg-zinc-800/50 ${searchType === 'multi' ? 'text-white font-medium bg-zinc-800/30' : 'text-zinc-400'}`}
                        >
                          Movies & TV Shows
                        </button>
                        <button 
                          onClick={() => { setSearchType('movie'); setIsDropdownOpen(false); }}
                          className={`text-left px-4 py-2.5 text-sm transition-colors hover:bg-zinc-800/50 ${searchType === 'movie' ? 'text-white font-medium bg-zinc-800/30' : 'text-zinc-400'}`}
                        >
                          Movies
                        </button>
                        <button 
                          onClick={() => { setSearchType('tv'); setIsDropdownOpen(false); }}
                          className={`text-left px-4 py-2.5 text-sm transition-colors hover:bg-zinc-800/50 ${searchType === 'tv' ? 'text-white font-medium bg-zinc-800/30' : 'text-zinc-400'}`}
                        >
                          TV Shows
                        </button>
                        <button 
                          onClick={() => { setSearchType('anime'); setIsDropdownOpen(false); }}
                          className={`text-left px-4 py-2.5 text-sm transition-colors hover:bg-zinc-800/50 ${searchType === 'anime' ? 'text-white font-medium bg-zinc-800/30' : 'text-zinc-400'}`}
                        >
                          Animes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={closeSearch}
                  className="bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-1.5 text-zinc-400 hover:text-white transition-colors"
                >
                  <Icons.x className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDownInput}
                placeholder="Type here to search..."
                className="w-full bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 text-lg transition-colors"
              />
              {query && !isLoading && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <Icons.x className="w-5 h-5" />
                </button>
              )}
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Icons.spinner className="w-5 h-5 text-zinc-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results */}
            {query.trim() !== '' && !isLoading && results.length > 0 && (
              <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-2xl mt-2">
                <div className="max-h-[60vh] overflow-y-auto scrollbar-hide p-2 space-y-1">
                  {results.map((item, index) => {
                    const media = item as any;
                    const title = media.title || media.name;
                    const year = media.release_date 
                      ? new Date(media.release_date).getFullYear() 
                      : media.first_air_date 
                        ? new Date(media.first_air_date).getFullYear() 
                        : '';
                    const type = media.media_type === 'tv' || media.first_air_date ? 'TV Show' : 'Movie';
                    const href = media.first_air_date ? `/tv/${media.id}` : `/movie/${media.id}`;
                    
                    const isExpanded = expandedId === media.id;

                    // Genres (mocked or extracted if available)
                    const genreIds = media.genre_ids || [];
                    const genreLabels = genreIds.length > 0 ? "Action & Adventure" : ""; // Simplified for visual parity

                    return (
                      <div 
                        key={`${media.id}-${index}`} 
                        className="flex flex-col p-3 hover:bg-zinc-900 rounded-xl transition-colors group"
                      >
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : media.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative w-[3.5rem] h-[5rem] rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900 border border-zinc-800/50">
                              <Image
                                src={`https://image.tmdb.org/t/p/w92${media.poster_path}`}
                                alt={title || 'Poster'}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                            <div className="flex flex-col">
                              <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors line-clamp-1">
                                {title}
                              </h3>
                              <div className="flex items-center text-xs text-zinc-400 mt-1.5 space-x-2">
                                <span>{type}</span>
                                {year && (
                                  <>
                                    <span className="text-zinc-600">|</span>
                                    <span>{year}</span>
                                  </>
                                )}
                                {media.vote_average > 0 && (
                                  <>
                                    <span className="text-zinc-600">|</span>
                                    <span className="flex items-center text-yellow-500">
                                      <Icons.star className="w-3.5 h-3.5 mr-1 fill-current" />
                                      {media.vote_average.toFixed(1)}
                                    </span>
                                  </>
                                )}
                                {genreLabels && (
                                  <>
                                    <span className="text-zinc-600">|</span>
                                    <span className="line-clamp-1">{genreLabels}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Icons.chevronDown className={`w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <p className="text-sm text-zinc-400 line-clamp-3 mb-4">
                              {media.overview || "No overview available."}
                            </p>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  triggerAdPopUp();
                                  handleLinkClick();
                                  import('./player-overlay').then(({ playMedia }) => {
                                    playMedia(media.media_type || (media.title ? 'movie' : 'tv'), media.id.toString(), 1, 1);
                                  });
                                }}
                                className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-colors"
                              >
                                <Icons.play className="w-4 h-4 fill-current" /> Play
                              </button>
                              <Link 
                                href={href} 
                                prefetch={false}
                                onClick={handleLinkClick} 
                                className="flex items-center justify-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-zinc-700 transition-colors"
                              >
                                <Icons.info className="w-4 h-4" /> See more
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {hasMore ? (
                    <div ref={observerTarget} className="py-4 flex justify-center">
                      <Icons.spinner className="w-6 h-6 text-zinc-500 animate-spin" />
                    </div>
                  ) : (
                    <div className="py-6 flex justify-center">
                      <span className="text-xs font-medium tracking-wider text-zinc-500 uppercase">End of results</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {query.trim() !== '' && !isLoading && results.length === 0 && (
              <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl p-8 text-center mt-2">
                <p className="text-zinc-400">No results found for &quot;{query}&quot;</p>
              </div>
            )}

            {/* Recent Searches Placeholder */}
            {query.trim() === '' && !isLoading && recentSearches.length > 0 && (
              <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-2xl mt-2 p-4">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Recent</h3>
                  <button onClick={clearRecent} className="text-xs text-zinc-400 hover:text-white transition-colors">Clear</button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((recentItem, index) => (
                    <button 
                      key={index}
                      onClick={() => setQuery(recentItem)}
                      className="w-full flex items-center gap-3 p-2 px-3 hover:bg-zinc-900 rounded-xl transition-colors text-zinc-300 hover:text-white text-sm"
                    >
                      <Icons.clock className="w-4 h-4 text-zinc-500" />
                      {recentItem}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
