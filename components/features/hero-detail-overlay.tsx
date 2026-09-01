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
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      // Wait 3 seconds of inactivity to trigger idle state
      timeout = setTimeout(() => setIsIdle(true), 3000);
    };

    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("touchstart", resetIdle);
    window.addEventListener("keydown", resetIdle);

    resetIdle();

    return () => {
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("touchstart", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <div
        className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent z-10 pointer-events-none"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent z-10 pointer-events-none md:w-[75%]"
      />

      <div className="absolute bottom-12 left-0 w-full px-4 sm:px-8 md:px-12 lg:px-16 z-20">
        <div className="max-w-2xl flex flex-col justify-end">
          <div
            className={`transition-all duration-1000 origin-bottom-left ${
              isIdle ? "scale-[0.8] mb-6" : "scale-100 mb-0"
            }`}
          >
            {logo}
          </div>

          <div
            className={`transition-all duration-1000 ease-in-out overflow-hidden ${
              isIdle ? "opacity-0 max-h-0 mt-0 mb-0" : "opacity-100 max-h-[300px] mt-4 mb-8"
            }`}
          >
            <div className="mb-4">{stats}</div>
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
