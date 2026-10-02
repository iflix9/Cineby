"use client";

import React, { useState, useEffect } from "react";

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
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleTrailerPlaying = (e: Event) => {
      const customEvt = e as CustomEvent<{ isPlaying: boolean }>;
      setIsTrailerPlaying(!!customEvt.detail?.isPlaying);
    };

    window.addEventListener("detail-trailer-playing", handleTrailerPlaying);
    return () => {
      window.removeEventListener("detail-trailer-playing", handleTrailerPlaying);
    };
  }, []);

  const shouldHideText = isTrailerPlaying && !isHovered;

  return (
    <>
      {/* Dynamic horizontal vignette: softens during trailer playback, deepens when reading metadata */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 via-35% md:via-50% to-transparent z-10 pointer-events-none w-full md:w-[75%] lg:w-[60%] transition-opacity duration-700 ease-in-out ${
          shouldHideText ? "opacity-35" : "opacity-95"
        }`}
      />
      {/* Ambient bottom scrim behind interactive buttons */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent z-10 pointer-events-none"
      />

      {/* Content wrapper aligned with 1440px container */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end px-4 sm:px-6 md:px-10 lg:px-[max(3rem,calc((100vw-1440px)/2+48px))] pb-8 sm:pb-12 md:pb-16 w-full md:w-3/4 lg:w-2/3 pointer-events-none">
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="max-w-xl sm:max-w-2xl flex flex-col justify-end pointer-events-auto"
        >
          {/* Logo or Title Heading - smoothly drops down near the buttons when trailer plays */}
          <div
            className={`transition-all duration-700 ease-in-out origin-bottom-left ${
              shouldHideText 
                ? "mb-3 sm:mb-4 scale-95 sm:scale-90" 
                : "mb-2 sm:mb-3 scale-100"
            }`}
          >
            {logo}
          </div>

          {/* Stats & Description - smoothly hides when trailer plays */}
          <div
            className={`transition-all duration-700 ease-in-out overflow-hidden ${
              shouldHideText
                ? "opacity-0 max-h-0 -translate-y-2 mt-0 mb-0 pointer-events-none"
                : "opacity-100 max-h-[350px] translate-y-0 mt-1 sm:mt-2 mb-4 sm:mb-6"
            }`}
          >
            <div className="mb-2.5 sm:mb-3.5">{stats}</div>
            <div>{description}</div>
          </div>

          {/* Action Buttons */}
          <div className="relative z-30">
            {buttons}
          </div>
        </div>
      </div>
    </>
  );
}
