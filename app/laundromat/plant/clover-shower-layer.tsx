"use client";

import { useEffect, useRef } from "react";

import type { CloverShowerPainter } from "./create-clover-shower-painter";
import { createCloverShowerPainter } from "./create-clover-shower-painter";

type CloverShowerLayerProps = {
  burstIds: number[];
  lite: boolean;
  still: boolean;
  onBurstDone: (id: number) => void;
};

/** One full-screen canvas on which every shower in `burstIds` falls at once; `onBurstDone` reports each shower whose last clover has left the screen. */
export function CloverShowerLayer(props: CloverShowerLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painterRef = useRef<CloverShowerPainter>(undefined);
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const painter = createCloverShowerPainter({
      canvas,
      lite: propsRef.current.lite,
      still: propsRef.current.still,
      onBurstDone: (id) => propsRef.current.onBurstDone(id),
    });
    painterRef.current = painter;
    return () => {
      painter.dispose();
      painterRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    props.burstIds.forEach((id) => painterRef.current?.addBurst(id));
  }, [props.burstIds]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
