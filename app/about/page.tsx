import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { Search, CheckCircle2, EyeOff, UserCheck, AlertTriangle, Mail } from 'lucide-react';

export const metadata = {
  title: 'About & Legal | Cineby',
  description: 'About Cineby: A metadata search engine and BYOC (Bring Your Own Content) client.',
};

export default function AboutPage() {
  return (
    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full min-h-screen text-white pb-32">
      {/* Page Title Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          About & Legal Information
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl">
          Everything you need to know about our service model, Bring Your Own Content (BYOC) architecture, and legal policies.
        </p>
      </div>

      {/* Grid of Legal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Service Model */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-blue-400 mb-1">
              Service Model
            </p>
            <h2 className="text-xl font-bold text-white mb-4">
              Bring Your Own Content (BYOC)
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                Cineby operates as a pure metadata search engine powered by The Movie Database (TMDB) API. The application itself acts merely as an empty client.
              </p>
              <p>
                <strong>Out of the box, Cineby does not contain, host, link to, or provide any media content whatsoever.</strong>
              </p>
              <p>
                To watch or stream anything, users must manually configure the application by providing their own third-party media player templates (i.e., a Bring Your Own Content setup). We have no control over the URLs that users choose to inject into their local clients.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Fair Use & Informational Content */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-emerald-400 mb-1">
              Fair Use & Educational
            </p>
            <h2 className="text-xl font-bold text-white mb-4">
              Informational Content
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                Cineby serves as an educational and informational tool, providing rich data about cinema including synopses, cast details, release dates, and general movie knowledge.
              </p>
              <p>
                The display of posters and metadata falls under Fair Use, as our platform functions strictly as an index and discovery engine for cinematic research. We do not host, distribute, or pirate any copyrighted media.
              </p>
              <p>
                As an informational database, any DMCA notices regarding media files are inherently misdirected, as no such files exist on our infrastructure. All video playback capabilities are provided locally by the user via their own Bring Your Own Content (BYOC) setup.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Data Protection */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
              <EyeOff className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-purple-400 mb-1">
              Data Protection
            </p>
            <h2 className="text-xl font-bold text-white mb-4">
              Privacy & Data
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                User privacy is deeply important to us. We don&apos;t collect, store, or track any personal information about our users on our servers.
              </p>
              <p>
                All personalized data—including watch history, bookmarks, and user-provided media templates—is stored entirely locally within the user&apos;s own browser using LocalStorage. We have no visibility into what templates users configure.
              </p>
            </div>
          </div>
        </div>

        {/* 4. User Responsibilities */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
              <UserCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-1">
              User Responsibilities
            </p>
            <h2 className="text-xl font-bold text-white mb-4">
              User Guidelines
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                By using Cineby, users accept full responsibility for the templates and third-party links they choose to inject into the application.
              </p>
              <p>
                Users are solely responsible for ensuring their usage complies with local laws and regulations in their respective jurisdictions.
              </p>
              <p>
                We strongly recommend utilizing secure connections (such as VPNs) to protect your privacy when interacting with third-party sources of your choosing.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Terms & Conditions */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300">
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-6">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-red-400 mb-1">
              Terms & Conditions
            </p>
            <h2 className="text-xl font-bold text-white mb-4">
              Service Terms
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                By utilizing the Cineby interface, you acknowledge that we are not responsible for the stability, safety, or legality of any third-party links or embedded sources you configure.
              </p>
              <p>
                We provide the software "as-is", primarily as an organizational layer over TMDB's public metadata, and assume zero liability for user actions or third-party downtime.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Legal Contact */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
              <Mail className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-cyan-400 mb-1">
              Legal Contact
            </p>
            <h2 className="text-xl font-bold text-white mb-4">
              Legal Inquiries
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                As established, Cineby does not host or link to any copyrighted media. Therefore, any DMCA notices demanding the removal of third-party links are inherently misdirected.
              </p>
              <p>
                If you still have legal questions regarding the software itself or wish to report abuse related to our metadata indexing, you may reach out to our legal channel.
              </p>
              <p>
                We operate in good faith and aim to respond to valid, legally sound inquiries within a reasonable timeframe.
              </p>
            </div>
            
            <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center gap-3 text-sm text-zinc-300">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-semibold text-zinc-400">Email:</span>
              <a 
                href="mailto:contact@cineby.im" 
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                contact@cineby.im
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
