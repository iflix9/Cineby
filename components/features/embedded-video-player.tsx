"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { useSearchParams } from "next/navigation";
import { DetailSettingsButton } from "./detail-settings-button";

interface EmbeddedVideoPlayerProps {
  videoKey?: string | null;
  fallbackImage: string;
  title: string;
}

export function EmbeddedVideoPlayer({
  videoKey,
  fallbackImage,
  title,
}: EmbeddedVideoPlayerProps) {
  const searchParams = useSearchParams();
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [hasPlayer, setHasPlayer] = useState(false);

  // Store the YouTubePlayer instance in a ref instead of state to prevent React Fiber circular JSON serialization errors
  const playerRef = useRef<YouTubePlayer | null>(null);

  const isPlayInUrl = searchParams?.get("play") === "true";
  const isPlayerActive = isPlayInUrl || isOverlayActive;

  const isPlayerActiveRef = useRef(isPlayerActive);
  useEffect(() => {
    isPlayerActiveRef.current = isPlayerActive;
  }, [isPlayerActive]);

  useEffect(() => {
    const isPlaying = isVideoReady && !isPlayerActive && !hasVideoError && !isFinished;
    window.dispatchEvent(new CustomEvent('detail-trailer-playing', { detail: { isPlaying } }));
    return () => {
      window.dispatchEvent(new CustomEvent('detail-trailer-playing', { detail: { isPlaying: false } }));
    };
  }, [isVideoReady, isPlayerActive, hasVideoError, isFinished]);

  useEffect(() => {
    const handlePlayMedia = () => {
      setIsOverlayActive(true);
    };
    const handlePlayerActive = (e: Event) => {
      const customEvt = e as CustomEvent<{ active: boolean }>;
      setIsOverlayActive(!!customEvt.detail?.active);
    };

    window.addEventListener("play-media", handlePlayMedia);
    window.addEventListener("player-active", handlePlayerActive);

    return () => {
      window.removeEventListener("play-media", handlePlayMedia);
      window.removeEventListener("player-active", handlePlayerActive);
    };
  }, []);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;

    if (isPlayerActive || isFinished) {
      try {
        p.mute();
        p.pauseVideo();
      } catch (err) {
        // ignore
      }
    } else {
      try {
        if (isMuted) {
          p.mute();
        } else {
          p.unMute();
        }
        p.playVideo();
      } catch (err) {
        // ignore
      }
    }
  }, [hasPlayer, isPlayerActive, isMuted, isFinished]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;

    // Detect when video reaches within 1.2s of the end to prevent end-screen cards, then stop and finish
    const interval = setInterval(async () => {
      if (isPlayerActiveRef.current || isFinished) return;

      try {
        const currentTime = await p.getCurrentTime();
        const duration = await p.getDuration();
        
        if (duration > 0 && duration - currentTime <= 1.2) {
          p.pauseVideo();
          setIsFinished(true);
        }
      } catch (err) {
        // gracefully ignore unready state errors
      }
    }, 150);

    return () => clearInterval(interval);
  }, [hasPlayer, isFinished]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      try {
        playerRef.current?.destroy();
      } catch (e) {
        // ignore
      }
      playerRef.current = null;
    };
  }, []);

  const onReady = (event: YouTubeEvent) => {
    const ytPlayer = event.target;
    playerRef.current = ytPlayer;
    setHasPlayer(true);
    ytPlayer.mute();

    if (isPlayerActiveRef.current) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }

    // The 3-Second Opacity Mask to hide YouTube initial UI flashes
    setTimeout(() => {
      setIsVideoReady(true);
    }, 3000);
  };

  const onStateChange = (event: YouTubeEvent) => {
    if (isPlayerActiveRef.current) {
      event.target.pauseVideo();
      return;
    }

    // PlayerState.PLAYING is 1 - immediately fade video in once frames start rolling
    if (event.data === 1) {
      setIsVideoReady(true);
    }

    // PlayerState.ENDED is 0
    if (event.data === 0) {
      setIsFinished(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const p = playerRef.current;
    if (p) {
      if (isMuted) {
        p.unMute();
        p.setVolume(100);
        p.playVideo();
      } else {
        p.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const p = playerRef.current;
    if (p) {
      try {
        setIsFinished(false);
        setIsVideoReady(true);
        p.seekTo(0);
        if (isMuted) {
          p.mute();
        } else {
          p.unMute();
        }
        p.playVideo();
      } catch (err) {
        // ignore
      }
    }
  };

  const playerOpts = {
    width: "100%",
    height: "100%",
    playerVars: {
      enablejsapi: 1,
      autoplay: 1,
      mute: 1,
      controls: 0,
      rel: 0,
      disablekb: 1,
      fs: 0,
      playsinline: 1,
      modestbranding: 1,
      iv_load_policy: 3,
      origin: typeof window !== 'undefined' ? window.location.origin : "",
    },
  };

  return (
    <>
      {/* Top Right Controls: Settings & Mute/Unmute or Replay Buttons */}
      {!isPlayerActive && (
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 md:right-8 z-[70] flex items-center gap-2.5 sm:gap-3">
          <DetailSettingsButton />
          {videoKey && !hasVideoError && (
            isFinished ? (
              <button
                type="button"
                onClick={handleReplay}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_6px_rgba(0,0,0,0.4)] text-zinc-300 hover:text-white hover:ring-white/30 active:scale-95 transition-all duration-200 group/replay cursor-pointer"
                aria-label="Replay trailer"
                title="Replay trailer"
              >
                <RotateCcw className="w-5 h-5 text-zinc-300 group-hover/replay:text-white transition-transform duration-300 group-hover/replay:-rotate-45" />
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleMute}
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl ring-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_6px_rgba(0,0,0,0.4)] active:scale-95 transition-all duration-200 group/mute cursor-pointer ${
                  !isMuted
                    ? "bg-red-600/90 hover:bg-red-600 ring-red-500/40 text-white shadow-[0_0_16px_rgba(239,68,68,0.4)]"
                    : "bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 hover:ring-white/30 text-zinc-300 hover:text-white ring-white/10"
                }`}
                aria-label={isMuted ? "Unmute trailer" : "Mute trailer"}
                title={isMuted ? "Unmute trailer" : "Mute trailer"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 transition-colors" />
                ) : (
                  <Volume2 className="w-5 h-5 transition-colors animate-pulse text-white" />
                )}
              </button>
            )
          )}
        </div>
      )}

      {/* Fallback Static Backdrop Image */}
      <div className="absolute inset-0">
        <Image
          src={fallbackImage}
          alt={title || "Backdrop"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          referrerPolicy="no-referrer"
        />
        {/* Soft base tint for text clarity */}
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Embedded YouTube Player Layer */}
      {videoKey && !hasVideoError && (
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-out pointer-events-none overflow-hidden ${
            isVideoReady && !isPlayerActive && !isFinished ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex items-center justify-center">
            <div className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] relative flex items-center justify-center pointer-events-none scale-[1.15] sm:scale-[1.12] origin-center">
              <YouTube
                videoId={videoKey}
                opts={playerOpts}
                onReady={onReady}
                onEnd={() => setIsFinished(true)}
                onError={() => setHasVideoError(true)}
                onStateChange={onStateChange}
                className="w-full h-full pointer-events-none"
                iframeClassName="w-full h-full pointer-events-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Scrim - provides contrast for top navigation and controls */}
      <div className="absolute top-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-b from-zinc-950/80 via-zinc-950/30 to-transparent pointer-events-none z-10" />

      {/* Radial vignette for subtle cinematic depth */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(9,9,11,0.35)_100%)]" />

      {/* Seamless bottom fade directly into the page's zinc-950 background */}
      <div className="absolute bottom-0 inset-x-0 h-48 sm:h-64 md:h-80 bg-gradient-to-t from-zinc-950 via-zinc-950/90 via-35% md:via-45% to-transparent pointer-events-none z-10" />
    </>
  );
}
