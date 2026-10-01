'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Media, TMDBResponse } from '@/types/tmdb';
import { MovieCard } from '@/components/ui/movie-card';
import { Icons } from '@/components/ui/icons';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { MOVIE_GENRES, TV_GENRES, COUNTRIES, YEARS, MOVIE_CATEGORIES, TV_CATEGORIES } from '@/lib/filters';

interface BrowseClientProps {
  initialData: TMDBResponse<Media>;
  type: string;
  endpoint: string;
  queryParams: Record<string, string>;
}

const applyCategoryParams = (params: URLSearchParams, category: string, type: string) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  if (type === 'movie') {
    if (category === 'now_playing') {
      const pastMonth = new Date(today);
      pastMonth.setDate(today.getDate() - 30);
      params.set('with_release_type', '2|3');
      params.set('primary_release_date.gte', pastMonth.toISOString().split('T')[0]);
      params.set('primary_release_date.lte', todayStr);
      params.set('sort_by', 'popularity.desc');
    } else if (category === 'upcoming') {
      const nextMonth = new Date(today);
      nextMonth.setDate(today.getDate() + 30);
      params.set('with_release_type', '2|3');
      params.set('primary_release_date.gte', todayStr);
      params.set('primary_release_date.lte', nextMonth.toISOString().split('T')[0]);
      params.set('sort_by', 'popularity.desc');
    } else if (category === 'top_rated') {
      params.set('sort_by', 'vote_average.desc');
      params.set('vote_count.gte', '200');
      params.set('without_genres', '99,10755');
    } else {
      params.set('sort_by', 'popularity.desc');
    }
  } else {
    if (category === 'airing_today') {
      params.set('air_date.gte', todayStr);
      params.set('air_date.lte', todayStr);
      params.set('sort_by', 'popularity.desc');
    } else if (category === 'on_the_air') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      params.set('air_date.gte', todayStr);
      params.set('air_date.lte', nextWeek.toISOString().split('T')[0]);
      params.set('sort_by', 'popularity.desc');
    } else if (category === 'top_rated') {
      params.set('sort_by', 'vote_average.desc');
      params.set('vote_count.gte', '200');
    } else {
      params.set('sort_by', 'popularity.desc');
    }
  }
};

export function BrowseClient({ initialData, type, endpoint, queryParams }: BrowseClientProps) {
  const [items, setItems] = useState<Media[]>(initialData.results);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.page < initialData.total_pages);
  const [autoLoadMore, setAutoLoadMore] = useState(false);
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  
  const isInitialMount = useRef(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const isLoadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const queryParamsStr = JSON.stringify(queryParams);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const abortController = new AbortController();

    const fetchFilteredData = async () => {
      setIsLoading(true);
      setAutoLoadMore(false);
      try {
        const params = new URLSearchParams(queryParams);
        params.set('page', '1');
        
        applyCategoryParams(params, selectedCategory, type);
        
        if (selectedGenre) {
          if (type === 'anime') {
            params.set('with_genres', `16,${selectedGenre}`);
          } else {
            params.set('with_genres', selectedGenre);
          }
        } else if (type === 'anime') {
          params.set('with_genres', '16');
        }

        if (selectedCountry) {
          params.set('with_origin_country', selectedCountry);
        }

        if (selectedYear) {
          if (type === 'movie') {
            params.set('primary_release_year', selectedYear);
          } else {
            params.set('first_air_date_year', selectedYear);
          }
        }

        const response = await fetch(`/api/tmdb${endpoint}?${params.toString()}`, {
          signal: abortController.signal,
        });
        if (response.ok) {
          const data: TMDBResponse<Media> = await response.json();
          setItems(data.results);
          setPage(data.page);
          setHasMore(data.page < data.total_pages);
        }
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          console.error('Failed to filter items:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchFilteredData();

    return () => {
      abortController.abort();
    };
  }, [selectedGenre, selectedCountry, selectedYear, selectedCategory, type, endpoint, queryParamsStr, queryParams]);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    setIsLoading(true);

    try {
      const nextPage = page + 1;
      const params = new URLSearchParams(JSON.parse(queryParamsStr));
      params.set('page', nextPage.toString());
      
      applyCategoryParams(params, selectedCategory, type);
      
      if (selectedGenre) {
        if (type === 'anime') {
          params.set('with_genres', `16,${selectedGenre}`);
        } else {
          params.set('with_genres', selectedGenre);
        }
      } else if (type === 'anime') {
        params.set('with_genres', '16');
      }

      if (selectedCountry) {
        params.set('with_origin_country', selectedCountry);
      }

      if (selectedYear) {
        if (type === 'movie') {
          params.set('primary_release_year', selectedYear);
        } else {
          params.set('first_air_date_year', selectedYear);
        }
      }

      const response = await fetch(`/api/tmdb${endpoint}?${params.toString()}`);
      if (response.ok) {
        const data: TMDBResponse<Media> = await response.json();
        setItems(prev => {
          const newItems = data.results.filter(
            item => !prev.some(p => p.id === item.id)
          );
          return [...prev, ...newItems];
        });
        setPage(data.page);
        setHasMore(data.page < data.total_pages);
      }
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, queryParamsStr, selectedCategory, type, selectedGenre, selectedCountry, selectedYear, endpoint]);

  const handleInitialLoadMore = () => {
    setAutoLoadMore(true);
    loadMore();
  };

  useEffect(() => {
    if (!autoLoadMore || !hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current && hasMoreRef.current) {
          loadMore();
        }
      },
      { rootMargin: '350px' }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [autoLoadMore, hasMore, loadMore]);

  const genres = type === 'movie' ? MOVIE_GENRES : TV_GENRES;
  const categories = type === 'movie' ? MOVIE_CATEGORIES : TV_CATEGORIES;
  const showCountryFilter = type !== 'anime';

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <FilterDropdown 
          value={selectedCategory} 
          onChange={setSelectedCategory}
          options={categories}
        />
        
        <FilterDropdown 
          value={selectedGenre} 
          onChange={setSelectedGenre}
          options={genres}
          allOption={{ id: '', name: 'All Genres' }}
        />

        {showCountryFilter && (
          <FilterDropdown 
            value={selectedCountry} 
            onChange={setSelectedCountry}
            options={COUNTRIES}
            allOption={{ id: '', name: 'All Countries' }}
            searchable={true}
          />
        )}

        <FilterDropdown 
          value={selectedYear} 
          onChange={setSelectedYear}
          options={YEARS.map(y => ({ id: y, name: y }))}
          allOption={{ id: '', name: 'All Years' }}
          searchable={true}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 md:gap-6">
        {items.map((media) => (
          <MovieCard key={media.id} media={media} />
        ))}
      </div>

      {hasMore && !autoLoadMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleInitialLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-800 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Icons.spinner className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {hasMore && autoLoadMore && (
        <div ref={sentinelRef} className="mt-12 mb-8 flex justify-center items-center min-h-[60px]">
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/80 text-zinc-400 rounded-full text-sm border border-neutral-800">
              <Icons.spinner className="w-4 h-4 animate-spin text-red-500" />
              Loading more content...
            </div>
          )}
        </div>
      )}
    </>
  );
}
