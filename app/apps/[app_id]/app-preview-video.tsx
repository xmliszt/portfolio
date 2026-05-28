"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

type AppPreviewVideoProps = {
  src: string;
  posterUrl: string;
  className?: string;
};

/**
 * Plays the App Store Connect preview video.
 *
 * ASC delivers app previews as HLS (`.m3u8`). Decision order:
 *   1. Non-HLS source       → native `<video>`.
 *   2. `Hls.isSupported()`  → hls.js via MSE (Chrome, Firefox, Edge…).
 *   3. `canPlayType('application/vnd.apple.mpegurl')` → native HLS (Safari).
 *
 * hls.js is checked *before* canPlayType because Chrome reports
 * "maybe" for the HLS MIME type yet cannot actually decode it.
 */
export function AppPreviewVideo(props: AppPreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Chrome enforces muted-at-load for autoplay; set imperatively so it is
    // guaranteed in place before play() is called.
    video.muted = true;

    function tryPlay() {
      const playPromise = video?.play();
      if (!playPromise) return;
      playPromise.catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          (error.name === "AbortError" || error.name === "NotAllowedError")
        ) {
          return;
        }
        console.warn("[app-preview-video] play() failed:", error);
      });
    }

    const isHls = props.src.toLowerCase().includes(".m3u8");

    if (!isHls) {
      video.src = props.src;
      tryPlay();
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(props.src));
      hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn("[app-preview-video] hls fatal error:", data);
        }
      });
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl") !== "") {
      video.src = props.src;
      tryPlay();
      return;
    }

    console.warn(
      "[app-preview-video] HLS not supported in this browser and hls.js unavailable"
    );
  }, [props.src]);

  return (
    <video
      ref={videoRef}
      poster={props.posterUrl}
      className={props.className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="App preview video"
    />
  );
}
