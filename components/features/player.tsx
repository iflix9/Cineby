'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { Link2, Trash2, Edit2, PlayCircle, Info } from 'lucide-react';
import { useHistory } from '@/hooks/use-history';
import { useCustomSources } from '@/hooks/use-custom-sources';
import { isBlockedMedia } from '@/lib/tmdb';

export interface PlayerProps {
  type: 'movie' | 'tv';
  mediaId: string;
  season?: number;
  episode?: number;
  onEpisodeChange?: (season: number, episode: number) => void;
}

export function Player({
  type,
  mediaId,
  season,
  episode,
  onEpisodeChange
}: PlayerProps) {
  const router = useRouter();
  const { sources, movieTemplate, tvTemplate, setSource, removeSource } = useCustomSources();
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  const sourceKey = type === 'tv' ? `${type}-${mediaId}-${season}-${episode}` : `${type}-${mediaId}`;
  
  // Custom URL takes precedence if it exists in individual sources
  let customUrl = sources[sourceKey];
  let isFromTemplate = false;

  if (!customUrl) {
    if (type === 'movie' && movieTemplate) {
      customUrl = movieTemplate
        .replace(/{id}/g, mediaId)
        .replace(/{tmdb_id}/g, mediaId);
      isFromTemplate = true;
    } else if (type === 'tv' && tvTemplate) {
      customUrl = tvTemplate
        .replace(/{id}/g, mediaId)
        .replace(/{tmdb_id}/g, mediaId)
        .replace(/{season}/g, String(season || 1))
        .replace(/{episode}/g, String(episode || 1));
      isFromTemplate = true;
    }
  }
  
  const [inputUrl, setInputUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Handle auto-hiding UI on inactivity
  const handleInteraction = useCallback(() => {
    setIsVisible(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 5000);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [handleInteraction]);

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setSource(sourceKey, inputUrl.trim());
      setIsEditing(false);
      setInputUrl('');
    }
  };

  const handleRemoveSource = () => {
    removeSource(sourceKey);
    setIsEditing(false);
  };

  // Ref to track last time-tracking playback event timestamp for 30-second throttling
  const lastTrackedTimeRef = useRef<number>(0);

  // Handle message events for iframe embed players
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

        // Apply a 30-second throttle to time-tracking playback events
        const isTimeTrackingEvent =
          data.event === 'timeupdate' ||
          data.type === 'progress' ||
          data.type === 'timeupdate' ||
          data.progress !== undefined ||
          data.currentTime !== undefined ||
          data.timestamp !== undefined ||
          data.time !== undefined;

        if (isTimeTrackingEvent) {
          const now = Date.now();
          if (now - lastTrackedTimeRef.current < 30000) {
            return;
          }
          lastTrackedTimeRef.current = now;

          if (data.currentTime !== undefined || data.progress !== undefined) {
            const calculatedProgress = data.progress ?? (data.duration ? Math.min(100, Math.round((data.currentTime / data.duration) * 100)) : undefined);
            
            useHistory.getState().updateProgress(String(mediaId), type, {
              season: type === 'tv' ? season : undefined,
              episode: type === 'tv' ? episode : undefined,
              progress: calculatedProgress,
              currentTime: data.currentTime,
              duration: data.duration,
            });

            fetch('/api/watch-history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mediaId,
                type,
                season,
                episode,
                progress: calculatedProgress,
                currentTime: data.currentTime,
                duration: data.duration,
              }),
            }).catch(() => {});
          }
        }

        if (type === 'tv') {
          const seasonNum = data.season || data.s || data?.data?.season;
          const episodeNum = data.episode || data.ep || data.e || data?.data?.episode;
          
          if (seasonNum && episodeNum && (String(seasonNum) !== String(season) || String(episodeNum) !== String(episode))) {
            if (onEpisodeChange) {
              onEpisodeChange(Number(seasonNum), Number(episodeNum));
            } else {
              router.replace(`/tv/${mediaId}/${seasonNum}/${episodeNum}`, { scroll: false });
            }
          }
        }
      } catch (err) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [type, mediaId, router, season, episode, onEpisodeChange]);

  if (isBlockedMedia(mediaId, type)) {
    return null;
  }

  const showInputForm = !customUrl || isEditing;

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center">
      {customUrl && !isEditing && (
        <iframe
          allowFullScreen
          id="watch-iframe"
          src={customUrl}
          className="w-full h-full border-0 absolute inset-0 z-0 bg-black"
        />
      )}
      
      {showInputForm && (
        <div className="z-10 w-full max-w-xl mx-auto p-8 bg-[#111111] rounded-2xl border border-zinc-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Link2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Bring Your Own Content</h2>
              <p className="text-sm text-zinc-400">
                Provide an embed URL or video link to play this {type === 'tv' ? 'episode' : 'movie'}.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSource} className="space-y-4">
            <div>
              <label htmlFor="source-url" className="block text-sm font-medium text-zinc-300 mb-2">
                Media Source URL
              </label>
              <input
                id="source-url"
                type="url"
                required
                placeholder="https://example.com/embed/..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-white text-black hover:bg-zinc-200 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                {customUrl ? 'Update Source' : 'Set Source & Play'}
              </button>
              
              {customUrl && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-zinc-800 text-white hover:bg-zinc-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 flex items-start gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
            <Info className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-400 space-y-1">
              <p>For DMCA compliance, this platform operates as a metadata search engine only and does not host or proxy streaming media.</p>
              <p>Your provided source URL is stored securely in your browser&apos;s local storage and is never sent to our servers.</p>
              <p className="mt-2 text-red-400">Tip: Click the user icon in the top navigation bar to configure global templates for all movies and shows.</p>
            </div>
          </div>
        </div>
      )}

      {/* Player Source Controls (when playing) */}
      {customUrl && !isEditing && (
        <div 
          className={`fixed top-6 right-6 md:top-10 md:right-12 z-[110] transition-all duration-500 ease-in-out flex gap-2 ${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setInputUrl(customUrl || '');
              setIsEditing(true);
            }}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800/90 text-white backdrop-blur-md border border-zinc-800/80 shadow-2xl transition-all hover:scale-105 active:scale-95 group"
            title={isFromTemplate ? "Override Template Source" : "Edit Source"}
          >
            <Edit2 className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
          </button>
          
          {!isFromTemplate && (
            <button
              type="button"
              onClick={handleRemoveSource}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800/90 text-white backdrop-blur-md border border-zinc-800/80 shadow-2xl transition-all hover:scale-105 active:scale-95 group hover:border-red-500/50"
              title="Remove Source"
            >
              <Trash2 className="w-4 h-4 text-zinc-300 group-hover:text-red-500 transition-colors" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
