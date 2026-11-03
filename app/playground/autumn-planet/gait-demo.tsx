"use client";

import { useEffect, useRef, useState } from "react";

import { createAutumnPlanet } from "./autumn-planet-scene";
import { SpeedSlider } from "./speed-slider";

const WALK_SPEED = 0.15;
const GALLOP_SPEED = 1.3;

export function GaitDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef({ speed: 0.3 });
  const [speed, setSpeed] = useState(0.3);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    return createAutumnPlanet(container, {
      mode: "gait",
      control: controlRef.current,
    });
  }, []);

  function handleSpeedChange(next: number) {
    controlRef.current.speed = next;
    setSpeed(next);
  }

  return (
    <figure className="m-0 flex w-full flex-col gap-y-3">
      <div
        ref={containerRef}
        className="h-[260px] w-full overflow-hidden rounded-[32px]"
      />
      <div className="flex w-full max-w-sm items-center gap-x-4 text-sm">
        <span aria-hidden>Walk</span>
        <SpeedSlider
          id="gait-speed"
          label="Walking speed"
          min={WALK_SPEED}
          max={GALLOP_SPEED}
          value={speed}
          onChange={handleSpeedChange}
          className="min-w-0 flex-1"
        />
        <span aria-hidden>Gallop</span>
      </div>
    </figure>
  );
}
