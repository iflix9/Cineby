import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { Search, CheckCircle2, EyeOff, UserCheck, AlertTriangle, Mail } from 'lucide-react';

export const metadata = {
  title: 'Legal / DMCA | Cineby',
  description: 'DMCA and Legal Information regarding Cineby service model, content policies, and user responsibilities.',
};

export default function LegalPage() {
  return (
    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full min-h-screen text-white pb-32">
      {/* Page Title Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          DMCA + Legal Information
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          Important information about our service, content policies, and user responsibilities.
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
              How We Operate
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                Cineby functions as a search engine and content aggregator that indexes publicly available media from across the internet.
              </p>
              <p>
                We do not host, store, or control any media files – everything is sourced from external third-party websites that are already publicly accessible.
              </p>
              <p>
                Our automated systems simply provide links to content that is already available online, without bypassing any security measures.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Copyright Policy */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-emerald-400 mb-1">
              Copyright Policy
            </p>
            <h2 className="text-xl font-bold text-white mb-4">
              Content & Copyright
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                We&apos;re a search index. The actual video files live on third-party hosts that we don&apos;t own and don&apos;t control – we just point at them. If a file disappears upstream, our link breaks the same day. The host is the only party who can take a file down.
              </p>
              <p>
                That said, we don&apos;t want to make life harder for rights holders. If you own the rights to a title and send us a notice with enough detail to identify it, we&apos;ll delist it from our search so it can&apos;t be reached from anywhere on the site – and we&apos;ll happily tell you exactly which upstream sources we were pulling it from, so you can chase the files at their actual source.
              </p>
              <p>
                Blocking a title here won&apos;t make it disappear from the internet – it only stops users from finding it through us. But that&apos;s the part we control, and we&apos;ll act on it in good faith.
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
                User privacy is important to us. We don&apos;t collect, store, or track any personal information about our users.
              </p>
              <p>
                Optionally, users can store their bookmarks and watch history in their browser client local storage. But we don&apos;t store any personal information or identifying data on external servers.
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
                Users are responsible for ensuring their access complies with local laws and regulations in their jurisdiction.
              </p>
              <p>
                We strongly recommend using VPN services for enhanced privacy and security while browsing. Downloading is not advised.
              </p>
              <p>
                Please respect intellectual property rights and be mindful of copyright laws in your area.
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
                By using our platform, you acknowledge these terms and agree that we&apos;re not responsible for third-party content.
              </p>
              <p>
                We operate in good faith compliance with applicable laws and regulations. We are not liable for any damages or losses incurred while using our service.
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
                For DMCA notices, takedown requests, or anything else legal-related, please reach out via our legal channel.
              </p>
              <p>
                To help us turn things around quickly, include the title and year, an IMDB or TMDB ID if you have one, and a brief statement that you own the rights (or are authorised to act for the rights holder). Once we&apos;ve confirmed the claim, we&apos;ll delist the title from our search and reply with the upstream hosts we were pointing at – so you can pursue the actual files at their source.
              </p>
              <p>
                We try to acknowledge requests within a couple of days. Good faith on both sides goes a long way.
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
