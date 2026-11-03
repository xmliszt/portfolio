"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import { AspectRatio } from "./aspect-ratio";
import { HoverPerspectiveContainer } from "./hover-perspective-container";

const PREVIEW_HREF = "/playground/autumn-planet";

/** Link to the Cat Planet page whose preview is the live scene itself, loaded once the card nears the screen. */
export function CatPlanetPreviewLink() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = sceneRef.current;
    if (!container) return;
    let cleanup: (() => void) | undefined;
    let isDisposed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void import("@/app/playground/autumn-planet/autumn-planet-scene").then(
          (scene) => {
            if (isDisposed) return;
            cleanup = scene.createAutumnPlanet(container, {
              view: { active: false },
            });
          }
        );
      },
      { rootMargin: "200px" }
    );
    observer.observe(container);
    return () => {
      isDisposed = true;
      observer.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <Link href={PREVIEW_HREF} aria-label="Cat Planet (Fall)">
      <HoverPerspectiveContainer>
        <AspectRatio ratio={3 / 2}>
          <div
            ref={sceneRef}
            className="bg-muted pointer-events-none size-full"
          />
        </AspectRatio>
      </HoverPerspectiveContainer>
    </Link>
  );
}
