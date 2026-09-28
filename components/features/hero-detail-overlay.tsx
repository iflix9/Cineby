"use client";

import React from "react";

interface HeroDetailOverlayProps {
  logo: React.ReactNode;
  stats: React.ReactNode;
  description: React.ReactNode;
  buttons: React.ReactNode;
}

export function HeroDetailOverlay({
  logo,
  stats,
  description,
  buttons,
}: HeroDetailOverlayProps) {
  return (
    <>
      {/* Bottom fade */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 via-40% to-transparent z-10 pointer-events-none"
      />
      {/* Horizontal contrast vignette */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 to-zinc-950/20 sm:via-zinc-950/50 sm:to-transparent z-10 pointer-events-none w-full md:w-[75%]"
      />

      {/* Content wrapper aligned with 1440px container */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end px-4 sm:px-6 md:px-10 lg:px-[max(3rem,calc((100vw-1440px)/2+48px))] pb-8 sm:pb-12 md:pb-16 w-full md:w-3/4 lg:w-2/3 pointer-events-none">
        <div className="max-w-xl sm:max-w-2xl flex flex-col justify-end pointer-events-auto">
          <div className="mb-2 sm:mb-3">
            {logo}
          </div>

          <div className="mt-1 sm:mt-2 mb-4 sm:mb-6">
            <div className="mb-2.5 sm:mb-3.5">{stats}</div>
            <div>{description}</div>
          </div>

          <div className="relative z-20">
            {buttons}
          </div>
        </div>
      </div>
    </>
  );
}
