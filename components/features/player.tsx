'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Settings, Save, Info, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
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
  onBack?: () => void;
}

export function Player({
  type,
  mediaId,
  season,
  episode,
  onEpisodeChange,
  onBack,
}: PlayerProps) {
  const { movieTemplate, tvTemplate, setMovieTemplate, setTvTemplate } = useCustomSources();
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const sourceListRef = useRef<HTMLDivElement | null>(null);

  const [moviePlayers, setMoviePlayers] = useState<string[]>(() => {
    const list = movieTemplate.split(',').map((s) => s.trim()).filter(Boolean);
    return list.length > 0 ? list : [''];
  });
  const [tvPlayers, setTvPlayers] = useState<string[]>(() => {
    const list = tvTemplate.split(',').map((s) => s.trim()).filter(Boolean);
    return list.length > 0 ? list : [''];
  });

  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [isSourceListOpen, setIsSourceListOpen] = useState(false);

  const templates = (type === 'movie' ? movieTemplate : tvTemplate)
    ?.split(',')
    .map(t => t.trim())
    .filter(Boolean) || [];

  const currentTemplate = templates[activePlayerIndex] || templates[0] || '';

  let customUrl = '';
  if (currentTemplate) {
    customUrl = currentTemplate
      .replace(/{id}/g, mediaId)
      .replace(/{tmdb_id}/g, mediaId);
    
    if (type === 'tv') {
      customUrl = customUrl
        .replace(/{season}/g, String(season || 1))
        .replace(/{episode}/g, String(episode || 1));
    }
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

  // Close player source dropdown when clicking outside
  useEffect(() => {
    if (!isSourceListOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (sourceListRef.current && !sourceListRef.current.contains(e.target as Node)) {
        setIsSourceListOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSourceListOpen]);

  const handleUpdatePlayer = (index: number, val: string) => {
    const setList = type === 'movie' ? setMoviePlayers : setTvPlayers;
    if (val.includes(',')) {
      const parts = val.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        setList((prev) => {
          const next = [...prev];
          next.splice(index, 1, ...parts);
          return next;
        });
        return;
      }
    }
    setList((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAddPlayer = () => {
    const setList = type === 'movie' ? setMoviePlayers : setTvPlayers;
    setList((prev) => [...prev, '']);
  };

  const handleRemovePlayer = (index: number) => {
    const setList = type === 'movie' ? setMoviePlayers : setTvPlayers;
    setList((prev) => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSaveGlobal = (e: React.FormEvent) => {
    e.preventDefault();
    const validMovie = moviePlayers.map((p) => p.trim()).filter(Boolean).join(', ');
    const validTv = tvPlayers.map((p) => p.trim()).filter(Boolean).join(', ');
    setMovieTemplate(validMovie);
    setTvTemplate(validTv);
    setIsEditing(false);
    setActivePlayerIndex(0);
    setIsSourceListOpen(false);
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
          }
        }
      } catch (err) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [type, mediaId, season, episode]);

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

      {/* Screen wake interaction area when controls are hidden */}
      {!isVisible && (
        <div 
          className="absolute inset-0 z-[105]"
          onPointerMove={handleInteraction}
          onTouchStart={handleInteraction}
        />
      )}

      {/* Top Left Navigation & Controls (Back Button & Player List Button) */}
      <div 
        ref={sourceListRef}
        className={`fixed top-6 left-6 md:top-10 md:left-12 z-[110] transition-all duration-500 ease-in-out flex flex-col items-start gap-2 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button 
              type="button"
              onClick={onBack}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_6px_rgba(0,0,0,0.4)] hover:ring-red-500/50 hover:from-zinc-800 hover:to-zinc-900 text-zinc-300 hover:text-red-500 transition-all active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] group/back"
              title="Close Player"
              aria-label="Close Player"
            >
              <Icons.chevronLeft className="w-5 h-5 text-zinc-300 group-hover/back:text-red-500 transition-colors group-hover/back:-translate-x-0.5" />
            </button>
          )}

          {customUrl && !isEditing && templates.length > 1 && (
            <button
              type="button"
              onClick={() => setIsSourceListOpen(!isSourceListOpen)}
              className={`h-11 px-3.5 rounded-full flex items-center justify-center gap-2 backdrop-blur-xl border shadow-2xl transition-all hover:scale-105 active:scale-95 group ${
                isSourceListOpen 
                  ? 'bg-white text-black border-white' 
                  : 'bg-zinc-900/80 hover:bg-zinc-800/90 text-white border-zinc-800/80'
              }`}
              title="Change Player Source"
              aria-label="Change Player Source"
            >
              <Icons.list className={`w-4 h-4 transition-colors ${isSourceListOpen ? 'text-black' : 'text-zinc-300 group-hover:text-white'}`} />
              <span className="text-xs font-semibold tracking-wide">
                Player {activePlayerIndex + 1}
              </span>
            </button>
          )}
        </div>

        {/* Player List Dropdown */}
        {isSourceListOpen && templates.length > 1 && (
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-2 w-48 sm:w-52 flex flex-col gap-1 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Select Player
            </div>
            {templates.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setActivePlayerIndex(index);
                  setIsSourceListOpen(false);
                }}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-colors flex items-center justify-between ${
                  activePlayerIndex === index 
                    ? 'bg-red-500/10 text-red-500 font-semibold' 
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${activePlayerIndex === index ? 'bg-red-500' : 'bg-zinc-600'}`} />
                  Player {index + 1}
                </span>
                {activePlayerIndex === index && <Icons.check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
      
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
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/Z6DCPzgJ9a'} 
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                  {type === 'movie' ? 'Movie Players' : 'TV Show Players'}
                </label>
                <span className="text-xs text-zinc-500">
                  {(type === 'movie' ? moviePlayers : tvPlayers).length} configured
                </span>
              </div>

              {(type === 'movie' ? moviePlayers : tvPlayers).map((url, idx) => (
                <div key={idx} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-red-500' : 'bg-zinc-500'}`} />
                      Player {idx + 1} {idx === 0 && <span className="text-zinc-400 font-normal">(Default)</span>}
                    </span>

                    {((type === 'movie' ? moviePlayers : tvPlayers).length > 1 || url.trim().length > 0) && (
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(idx)}
                        className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Remove Player"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUpdatePlayer(idx, e.target.value)}
                    placeholder={
                      type === 'movie'
                        ? 'https://example.com/player/movie/{id}?autoplay=true'
                        : 'https://example.com/player/tv/{id}/{season}/{episode}?autoplay=true'
                    }
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-mono text-xs sm:text-sm"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddPlayer}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-zinc-700 hover:border-red-500/60 bg-zinc-900/40 hover:bg-red-500/10 text-zinc-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Plus className="w-4 h-4 text-red-500" />
                <span>Add Player {(type === 'movie' ? moviePlayers : tvPlayers).length + 1}</span>
              </button>
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
            <div className="text-xs text-zinc-400 space-y-2">
              <p>You can add <strong>multiple players</strong> by separating URLs with a comma (<code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">,</code>).</p>
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
    </div>
  );
}
