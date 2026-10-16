'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Save, Info, Plus, Trash2, ArrowUp, ArrowDown, Clapperboard, Tv, Bookmark } from 'lucide-react';
import { useCustomSources } from '@/hooks/use-custom-sources';
import { Icons } from '@/components/ui/icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isOpen || !isClient) return null;
  return createPortal(<SettingsModalContent onClose={onClose} />, document.body);
}

function SettingsModalContent({ onClose }: { onClose: () => void }) {
  const { movieTemplate, tvTemplate, streamingMode, setMovieTemplate, setTvTemplate, setStreamingMode } = useCustomSources();
  
  const [localStreamingMode, setLocalStreamingMode] = useState(streamingMode);
  const [activeTab, setActiveTab] = useState<'movie' | 'tv'>('movie');

  const [moviePlayers, setMoviePlayers] = useState<string[]>(() => {
    const list = movieTemplate.split(',').map((s) => s.trim()).filter(Boolean);
    return list.length > 0 ? list : [''];
  });

  const [tvPlayers, setTvPlayers] = useState<string[]>(() => {
    const list = tvTemplate.split(',').map((s) => s.trim()).filter(Boolean);
    return list.length > 0 ? list : [''];
  });

  const currentPlayers = activeTab === 'movie' ? moviePlayers : tvPlayers;

  const updatePlayer = (tab: 'movie' | 'tv', index: number, value: string) => {
    const setList = tab === 'movie' ? setMoviePlayers : setTvPlayers;
    
    // Auto-split if user pastes comma-separated URLs
    if (value.includes(',')) {
      const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
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
      next[index] = value;
      return next;
    });
  };

  const addPlayer = (tab: 'movie' | 'tv') => {
    const setList = tab === 'movie' ? setMoviePlayers : setTvPlayers;
    setList((prev) => [...prev, '']);
  };

  const removePlayer = (tab: 'movie' | 'tv', index: number) => {
    const setList = tab === 'movie' ? setMoviePlayers : setTvPlayers;
    setList((prev) => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  };

  const movePlayer = (tab: 'movie' | 'tv', index: number, direction: 'up' | 'down') => {
    const setList = tab === 'movie' ? setMoviePlayers : setTvPlayers;
    setList((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStreamingMode(localStreamingMode);

    const validMovie = moviePlayers.map((p) => p.trim()).filter(Boolean).join(', ');
    const validTv = tvPlayers.map((p) => p.trim()).filter(Boolean).join(', ');

    setMovieTemplate(validMovie);
    setTvTemplate(validTv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Settings</h2>
              <p className="text-xs text-zinc-400 hidden sm:block">Manage your library, streaming mode, and player sources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/Z6DCPzgJ9a'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/20 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              title="Join our community Discord"
            >
              <Icons.discord className="w-4 h-4" />
              <span className="hidden sm:inline">Join Discord</span>
            </a>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Quick Access: My List & History */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Library & Activity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/watchlist"
                onClick={onClose}
                className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-900/40 hover:from-zinc-800/90 hover:to-zinc-800/60 border border-zinc-800 hover:border-zinc-700/80 transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 transition-colors border border-red-500/20">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white text-sm group-hover:text-red-400 transition-colors flex items-center justify-between">
                    <span>My List</span>
                    <Icons.chevronRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">Your saved titles</p>
                </div>
              </Link>

              <Link
                href="/history"
                onClick={onClose}
                className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-900/40 hover:from-zinc-800/90 hover:to-zinc-800/60 border border-zinc-800 hover:border-zinc-700/80 transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 transition-colors border border-amber-500/20">
                  <Icons.clock className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors flex items-center justify-between">
                    <span>History</span>
                    <Icons.chevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">Continue watching</p>
                </div>
              </Link>
            </div>
          </div>

          <form id="settings-form" onSubmit={handleSave} className="space-y-6">
            {/* Streaming Mode Toggle */}
            <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-900/40 p-4 sm:p-5 rounded-xl border border-zinc-800 shadow-sm hover:border-zinc-700/70 transition-colors space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center flex-wrap gap-2 min-w-0">
                  <span className="font-semibold text-white text-sm sm:text-base whitespace-nowrap">Streaming Mode</span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                      localStreamingMode
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                    }`}
                  >
                    {localStreamingMode ? 'ON • Streaming' : 'OFF • Trailer'}
                  </span>
                </div>

                {/* Toggle switch with embedded ON / OFF labels */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={localStreamingMode}
                  onClick={() => setLocalStreamingMode(!localStreamingMode)}
                  className={`relative inline-flex h-7 sm:h-8 w-14 sm:w-16 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500/50 select-none ${
                    localStreamingMode
                      ? 'bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]'
                      : 'bg-zinc-800 border border-zinc-700/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]'
                  }`}
                  aria-label={`Toggle Streaming Mode: Currently ${localStreamingMode ? 'ON' : 'OFF'}`}
                >
                  <span
                    className={`absolute left-2 text-[9px] sm:text-[10px] font-extrabold tracking-wider text-white transition-opacity duration-200 select-none ${
                      localStreamingMode ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    ON
                  </span>
                  <span
                    className={`absolute right-1.5 sm:right-2 text-[9px] sm:text-[10px] font-extrabold tracking-wider text-zinc-400 transition-opacity duration-200 select-none ${
                      localStreamingMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                  >
                    OFF
                  </span>
                  <span
                    className={`pointer-events-none inline-block h-5 sm:h-6 w-5 sm:w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      localStreamingMode ? 'translate-x-7 sm:translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                When enabled (<span className="text-zinc-200 font-medium">ON</span>), the Play button launches the embed player stream. When turned off (<span className="text-zinc-200 font-medium">OFF</span>), it plays the official trailer.
              </p>
            </div>

            {/* Custom Players Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Custom Players</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Add Player 1, Player 2, and switch between sources in the player.</p>
                </div>
              </div>

              {/* Player Tabs: Movie Players vs TV Show Players */}
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('movie')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'movie'
                      ? 'bg-white text-black shadow-md shadow-white/10'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
                  }`}
                >
                  <Clapperboard className="w-4 h-4" />
                  <span>Movie Players</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'movie' ? 'bg-black/15 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {moviePlayers.filter((p) => p.trim()).length || 1}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tv')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'tv'
                      ? 'bg-white text-black shadow-md shadow-white/10'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>TV Show Players</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'tv' ? 'bg-black/15 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tvPlayers.filter((p) => p.trim()).length || 1}
                  </span>
                </button>
              </div>

              {/* Player List */}
              <div className="space-y-3">
                {currentPlayers.map((playerUrl, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 space-y-2 hover:border-zinc-700/80 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700/60 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-red-500' : 'bg-zinc-500'}`} />
                          Player {index + 1}
                        </span>
                        {index === 0 && (
                          <span className="text-[11px] font-semibold text-zinc-400">
                            (Default)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => movePlayer(activeTab, index, 'up')}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {index < currentPlayers.length - 1 && (
                          <button
                            type="button"
                            onClick={() => movePlayer(activeTab, index, 'down')}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(currentPlayers.length > 1 || playerUrl.trim().length > 0) && (
                          <button
                            type="button"
                            onClick={() => removePlayer(activeTab, index)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                            title="Remove Player"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={playerUrl}
                        onChange={(e) => updatePlayer(activeTab, index, e.target.value)}
                        placeholder={
                          activeTab === 'movie'
                            ? 'https://example.com/embed/movie/{id}?autoplay=true'
                            : 'https://example.com/embed/tv/{id}/{season}/{episode}?autoplay=true'
                        }
                        className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-mono text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                ))}

                {/* Add Player Button */}
                <button
                  type="button"
                  onClick={() => addPlayer(activeTab)}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-zinc-700/80 hover:border-red-500/60 bg-zinc-900/40 hover:bg-red-500/10 text-zinc-200 hover:text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] group shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-800 group-hover:bg-red-500 flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white" />
                  </div>
                  <span>Add Player {currentPlayers.length + 1}</span>
                </button>
              </div>

              {/* Supported Placeholders Guide */}
              <div className="flex items-start gap-3 p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-800/60 text-xs text-zinc-400">
                <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-zinc-300">
                    Supported placeholders for {activeTab === 'movie' ? 'Movies' : 'TV Shows'}:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                    <span className="bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 rounded text-red-400">
                      {'{id}'} <span className="text-zinc-400 font-sans">- TMDB ID</span>
                    </span>
                    {activeTab === 'tv' && (
                      <>
                        <span className="bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 rounded text-red-400">
                          {'{season}'} <span className="text-zinc-400 font-sans">- Season #</span>
                        </span>
                        <span className="bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 rounded text-red-400">
                          {'{episode}'} <span className="text-zinc-400 font-sans">- Episode #</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-900/30 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-zinc-300 bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_6px_rgba(0,0,0,0.2)] hover:text-white hover:from-zinc-700/80 hover:to-zinc-800/80 transition-all duration-200 active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
          >
            Cancel
          </button>
          <button
            form="settings-form"
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-gradient-to-b from-white to-zinc-200 text-black ring-1 ring-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_2px_6px_rgba(0,0,0,0.3)] hover:from-white hover:to-zinc-100 transition-all duration-200 active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Save className="w-4 h-4 shrink-0" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
