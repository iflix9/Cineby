'use client';

import { useState } from 'react';
import { Settings, X, Save, Info } from 'lucide-react';
import { useCustomSources } from '@/hooks/use-custom-sources';
import { Icons } from '@/components/ui/icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { movieTemplate, tvTemplate, setMovieTemplate, setTvTemplate } = useCustomSources();
  
  const [localMovie, setLocalMovie] = useState(movieTemplate);
  const [localTv, setLocalTv] = useState(tvTemplate);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMovieTemplate(localMovie);
    setTvTemplate(localTv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Player Settings</h2>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={process.env.NEXT_PUBLIC_API_LINK} 
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
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6 flex items-start gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
            <Info className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
            <div className="text-sm text-zinc-400 space-y-2">
              <p>Configure global templates for media playback. Use placeholders to dynamically inject media data.</p>
              <p>Available placeholders:</p>
              <ul className="list-disc list-inside text-zinc-500 space-y-1 ml-1">
                <li><code className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded text-xs">{'{id}'}</code> - TMDB ID</li>
                <li><code className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded text-xs">{'{season}'}</code> - TV Season number</li>
                <li><code className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded text-xs">{'{episode}'}</code> - TV Episode number</li>
              </ul>
            </div>
          </div>

          <form id="settings-form" onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
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
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-900/30 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            form="settings-form"
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Save className="w-4 h-4 shrink-0" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
