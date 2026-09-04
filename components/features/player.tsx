'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Trash2, Save, Info } from 'lucide-react';
import { useHistory } from '@/hooks/use-history';
import { useCustomSources } from '@/hooks/use-custom-sources';
import { isBlockedMedia } from '@/lib/tmdb';
import { Icons } from '@/components/ui/icons';

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
  const { movieTemplate, tvTemplate, setMovieTemplate, setTvTemplate } = useCustomSources();
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  const [localMovie, setLocalMovie] = useState(movieTemplate);
  const [localTv, setLocalTv] = useState(tvTemplate);

  const startEditing = () => {
    setLocalMovie(movieTemplate);
    setLocalTv(tvTemplate);
    setIsEditing(true);
  };

  let customUrl = '';
  if (type === 'movie' && movieTemplate) {
    customUrl = movieTemplate
      .replace(/{id}/g, mediaId)
      .replace(/{tmdb_id}/g, mediaId);
  } else if (type === 'tv' && tvTemplate) {
    customUrl = tvTemplate
      .replace(/{id}/g, mediaId)
      .replace(/{tmdb_id}/g, mediaId)
      .replace(/{season}/g, String(season || 1))
      .replace(/{episode}/g, String(episode || 1));
  }
  
  const [isEditing, setIsEditing] = useState(false);
  const hasTemplate = type === 'movie' ? !!movieTemplate : !!tvTemplate;

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

  const handleSaveGlobal = (e: React.FormEvent) => {
    e.preventDefault();
    setMovieTemplate(localMovie.trim());
    setTvTemplate(localTv.trim());
    setIsEditing(false);
  };

  const handleClearTemplates = () => {
    if (type === 'movie') {
       setMovieTemplate('');
       setLocalMovie('');
    } else {
       setTvTemplate('');
       setLocalTv('');
    }
    setIsEditing(true);
  };

  const lastTrackedTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

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

  const showInputForm = !hasTemplate || isEditing;

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
        <div className="z-10 w-full max-w-xl mx-auto p-8 bg-[#111111] rounded-2xl border border-zinc-800 shadow-2xl mt-16 md:mt-0 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <Settings className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Player Settings</h2>
                <p className="text-sm text-zinc-400 hidden sm:block">
                  Configure global templates to automatically play media.
                </p>
              </div>
            </div>
            
            <a 
              href={process.env.NEXT_PUBLIC_API_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/20 px-3 py-2 rounded-xl text-sm font-medium transition-colors shrink-0"
              title="Join our community Discord"
            >
              <Icons.discord className="w-4 h-4" />
              <span className="hidden sm:inline">Join Discord</span>
            </a>
          </div>

          <form onSubmit={handleSaveGlobal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Movie Template URL</label>
              <input
                type="text"
                value={localMovie}
                onChange={(e) => setLocalMovie(e.target.value)}
                placeholder="https://example.com/player/movie/{id}?autoplay=true"
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">TV Show Template URL</label>
              <input
                type="text"
                value={localTv}
                onChange={(e) => setLocalTv(e.target.value)}
                placeholder="https://example.com/player/tv/{id}/{season}/{episode}?autoplay=true"
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-mono text-sm"
              />
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
              {hasTemplate && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto bg-zinc-800 text-white hover:bg-zinc-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="flex-1 w-full bg-white text-black hover:bg-zinc-200 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Save className="w-5 h-5 shrink-0" />
                {hasTemplate ? 'Update Settings' : 'Save & Play'}
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-start gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
            <Info className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-400 space-y-1">
              <p>Available placeholders:</p>
              <ul className="list-disc list-inside space-y-1 ml-1 text-zinc-500">
                <li><code className="text-red-400 bg-red-500/10 px-1 py-0.5 rounded">{'{id}'}</code> - TMDB ID</li>
                <li><code className="text-red-400 bg-red-500/10 px-1 py-0.5 rounded">{'{season}'}</code> - TV Season number</li>
                <li><code className="text-red-400 bg-red-500/10 px-1 py-0.5 rounded">{'{episode}'}</code> - TV Episode number</li>
              </ul>
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
            onClick={startEditing}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800/90 text-white backdrop-blur-md border border-zinc-800/80 shadow-2xl transition-all hover:scale-105 active:scale-95 group"
            title="Edit Player Settings"
          >
            <Settings className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
          </button>
          
          <button
            type="button"
            onClick={handleClearTemplates}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800/90 text-white backdrop-blur-md border border-zinc-800/80 shadow-2xl transition-all hover:scale-105 active:scale-95 group hover:border-red-500/50"
            title="Clear Current Template"
          >
            <Trash2 className="w-5 h-5 text-zinc-300 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      )}
    </div>
  );
}
