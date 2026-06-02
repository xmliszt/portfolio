"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import Image from "next/image";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const IMAGE_DURATION_MS = 5000;
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"];

type ChangelogHeaderCarouselProps = {
  images: string[];
  alt: string;
};

function isVideo(src: string): boolean {
  const path = src.toLowerCase().split("?").at(0) ?? "";
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}

export function ChangelogHeaderCarousel(props: ChangelogHeaderCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Progress (0..1) is a motion value, not React state: the rAF loops below
  // update it ~60fps, and pushing that through setState would re-render the
  // whole carousel tree every frame. A motion value lets Framer Motion write
  // the bar's transform directly, bypassing React render entirely.
  const progress = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const currentSrc = props.images[selectedIndex];
  const currentIsVideo = currentSrc ? isVideo(currentSrc) : false;

  const goNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  useEffect(() => {
    if (!api) return;
    function onSelect() {
      if (!api) return;
      setSelectedIndex(api.selectedScrollSnap());
      progress.set(0);
    }
    function onPointerDown() {
      setIsPaused(true);
    }
    function onPointerUp() {
      setIsPaused(false);
    }
    api.on("select", onSelect);
    api.on("pointerDown", onPointerDown);
    api.on("pointerUp", onPointerUp);
    return () => {
      api.off("select", onSelect);
      api.off("pointerDown", onPointerDown);
      api.off("pointerUp", onPointerUp);
    };
  }, [api, progress]);

  // Image countdown driven by requestAnimationFrame
  useEffect(() => {
    if (currentIsVideo || !currentSrc) return;
    let frameId = 0;
    let lastMs = performance.now();
    let elapsedMs = 0;
    progress.set(0);
    function tick(nowMs: number) {
      const deltaMs = nowMs - lastMs;
      lastMs = nowMs;
      if (!isPaused) {
        elapsedMs += deltaMs;
        const next = Math.min(elapsedMs / IMAGE_DURATION_MS, 1);
        progress.set(next);
        if (next >= 1) {
          goNext();
          return;
        }
      }
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [selectedIndex, isPaused, currentIsVideo, currentSrc, goNext, progress]);

  // Reset videos when selected slide changes; play the current one
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === selectedIndex) {
        video.currentTime = 0;
        if (!isPaused) {
          void video.play().catch(() => {});
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
    // We intentionally only react to selectedIndex; pause toggling is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  // Pause/resume the currently visible video
  useEffect(() => {
    if (!currentIsVideo) return;
    const video = videoRefs.current[selectedIndex];
    if (!video) return;
    if (isPaused) {
      video.pause();
    } else {
      void video.play().catch(() => {});
    }
  }, [isPaused, selectedIndex, currentIsVideo]);

  // Video progress: sample currentTime each animation frame and push it
  // straight into the motion value. Reading currentTime per rAF frame is
  // smooth; the earlier stutter came from round-tripping through React state +
  // a Framer `animate`/`transition` tween, which re-rendered the tree and ran
  // an easing animation that fought the per-frame updates. Writing the motion
  // value directly avoids both.
  useEffect(() => {
    if (!currentIsVideo || !currentSrc) return;
    let frameId = 0;
    function tick() {
      const video = videoRefs.current[selectedIndex];
      const duration = video?.duration;
      if (video && duration && Number.isFinite(duration)) {
        progress.set(Math.min(video.currentTime / duration, 1));
      }
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [selectedIndex, currentIsVideo, currentSrc, progress]);

  function handleVideoEnded(index: number) {
    return function onEnded() {
      if (index !== selectedIndex) return;
      goNext();
    };
  }

  if (props.images.length === 1) {
    const src = props.images[0];
    return (
      <div className="flex w-full items-center justify-center overflow-hidden">
        {isVideo(src) ? (
          <video
            src={src}
            className="w-full max-w-[324px] rounded-3xl object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <Image
            src={src}
            alt={props.alt}
            width={800}
            height={450}
            className="w-full max-w-[324px] rounded-3xl object-cover"
            unoptimized
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-y-3">
      <Carousel
        setApi={setApi}
        className="w-full max-w-[324px]"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {props.images.map((src, index) => (
            <CarouselItem key={src}>
              {isVideo(src) ? (
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={src}
                  className="w-full rounded-3xl object-cover"
                  muted
                  playsInline
                  preload="auto"
                  onEnded={handleVideoEnded(index)}
                />
              ) : (
                <Image
                  src={src}
                  alt={`${props.alt} ${index + 1}`}
                  width={800}
                  height={450}
                  className="w-full rounded-3xl object-cover"
                  unoptimized
                />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex items-center gap-x-1.5">
        {props.images.map((src, index) => {
          const isActive = index === selectedIndex;
          return (
            <motion.button
              key={src}
              type="button"
              aria-label={`Go to item ${index + 1}`}
              onClick={() => api?.scrollTo(index)}
              animate={{ width: isActive ? 24 : 6 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className={cn(
                "relative h-1.5 overflow-hidden rounded-full",
                isActive ? "bg-muted-foreground/25" : "bg-muted-foreground/40"
              )}
            >
              {isActive && (
                <motion.div
                  className="bg-foreground absolute inset-y-0 left-0 w-full origin-left rounded-full"
                  style={{ scaleX: progress }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
