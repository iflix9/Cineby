"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
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
  const [isMuted, setIsMuted] = useState(true);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  const isPlayInUrl = searchParams?.get("play") === "true";
  const isPlayerActive = isPlayInUrl || isOverlayActive;

  const isPlayerActiveRef = useRef(isPlayerActive);
  useEffect(() => {
    isPlayerActiveRef.current = isPlayerActive;
  }, [isPlayerActive]);

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
    if (!player) return;

    if (isPlayerActive) {
      try {
        player.mute();
        player.pauseVideo();
      } catch (err) {
        // ignore
      }
    } else {
      try {
        if (isMuted) {
          player.mute();
        } else {
          player.unMute();
        }
        player.playVideo();
      } catch (err) {
        // ignore
      }
    }
  }, [player, isPlayerActive, isMuted]);

  useEffect(() => {
    if (!player) return;

    // Early Looping Strategy: continuously poll the player's time to prevent end-screen recommendation grids.
    const interval = setInterval(async () => {
      if (isPlayerActiveRef.current) return;

      try {
        const currentTime = await player.getCurrentTime();
        const duration = await player.getDuration();
        
        if (duration > 0 && duration - currentTime <= 1.5) {
          player.seekTo(0);
          player.playVideo();
        }
      } catch (err) {
        // gracefully ignore unready state errors
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player]);

  const onReady = (event: YouTubeEvent) => {
    const ytPlayer = event.target;
    setPlayer(ytPlayer);
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

    // Permanent End-Screen Blocking
    // PlayerState.ENDED is 0
    if (event.data === 0) {
      event.target.seekTo(0);
      event.target.playVideo();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (player) {
      if (isMuted) {
        player.unMute();
        player.setVolume(100);
        player.playVideo();
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
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
      {/* Top Right Controls: Settings & Mute/Unmute Buttons */}
      {!isPlayerActive && (
        <div className="absolute top-6 right-6 md:top-10 md:right-12 z-50 flex items-center gap-2.5 sm:gap-3">
          <DetailSettingsButton />
          {videoKey && (
            <button
              onClick={toggleMute}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_6px_rgba(0,0,0,0.3)] text-white hover:from-white/15 hover:to-white/10 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 group/mute"
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white transition-colors" />
              ) : (
                <Volume2 className="w-5 h-5 text-white transition-colors" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Background Video */}
      {videoKey && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none scale-[1.5] z-0">
            <YouTube
              videoId={videoKey}
              opts={playerOpts}
              onReady={onReady}
              onStateChange={onStateChange}
              className="absolute inset-0 w-full h-full pointer-events-none"
              iframeClassName={`w-full h-full pointer-events-none transition-opacity duration-1000 ${
                isVideoReady && !isPlayerActive ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
      )}

      {/* Fallback Image Layer (Fades out when video is ready & not active) */}
      <div
        className={`absolute inset-0 z-10 bg-zinc-950 pointer-events-none transition-opacity duration-1000 ease-in-out ${
          isVideoReady && !isPlayerActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={fallbackImage}
          alt={title}
          fill
          priority
          className="object-cover object-top pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </div>
    </>
  );
}
