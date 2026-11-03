"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

type SpeedSliderProps = {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (_value: number) => void;
  className?: string;
};

const KEY_STEP = 0.05;

export function SpeedSlider(props: SpeedSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const fraction = (props.value - props.min) / (props.max - props.min);

  function valueAt(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return props.value;
    const k = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return props.min + k * (props.max - props.min);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    isDraggingRef.current = true;
    props.onChange(valueAt(event.clientX));
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    props.onChange(valueAt(event.clientX));
  }

  function handlePointerUp() {
    isDraggingRef.current = false;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const span = props.max - props.min;
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[
      event.key
    ];
    if (event.key === "Home") props.onChange(props.min);
    else if (event.key === "End") props.onChange(props.max);
    else if (step) {
      const next = props.value + step * KEY_STEP * span;
      props.onChange(Math.min(props.max, Math.max(props.min, next)));
    } else return;
    event.preventDefault();
  }

  return (
    <div
      id={props.id}
      role="slider"
      tabIndex={0}
      aria-label={props.label}
      aria-valuemin={props.min}
      aria-valuemax={props.max}
      aria-valuenow={Number(props.value.toFixed(2))}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={cn(
        "group focus-visible:ring-ring/50 relative flex h-6 cursor-pointer touch-none items-center rounded-full outline-none select-none focus-visible:ring-[3px]",
        props.className
      )}
    >
      <div
        ref={trackRef}
        className="bg-foreground/15 relative h-1 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-foreground absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <div
        className="border-foreground bg-background absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm transition-transform group-active:scale-110"
        style={{ left: `${fraction * 100}%` }}
      />
    </div>
  );
}
