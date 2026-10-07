export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-black text-white animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[70vh] md:h-[85vh] bg-gradient-to-b from-zinc-900/60 via-zinc-950/80 to-black flex flex-col justify-end px-4 sm:px-6 md:px-12 pb-16">
        <div className="w-48 sm:w-72 h-10 sm:h-14 bg-zinc-800/70 rounded-xl mb-4" />
        <div className="w-36 h-5 bg-zinc-800/50 rounded-md mb-4" />
        <div className="max-w-xl h-14 bg-zinc-850/40 rounded-lg mb-6" />
        <div className="flex gap-3">
          <div className="w-32 h-11 bg-white/20 rounded-full" />
          <div className="w-32 h-11 bg-zinc-800/60 rounded-full" />
        </div>
      </div>

      {/* Row Skeletons */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-[1440px] space-y-12 mt-8 pb-20">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <div className="w-44 h-6 bg-zinc-800/70 rounded-md" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="aspect-[2/3] bg-zinc-900/80 rounded-xl border border-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
