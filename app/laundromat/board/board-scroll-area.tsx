import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const MIN_THUMB_PX = 28;
const RAIL_INSET_PX = 4;

type BoardScrollAreaProps = {
  className?: string;
  children: React.ReactNode;
};

type Thumb = { top: number; height: number };

/** Scroll `children` vertically behind a thin ink rail whose thumb can be dragged or whose track can be clicked, with the native scrollbar hidden. */
export function BoardScrollArea(props: BoardScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerY: number; scrollTop: number }>(undefined);
  const [thumb, setThumb] = useState<Thumb>();
  const [isDragging, setDragging] = useState(false);

  function measure() {
    const viewport = viewportRef.current;
    const rail = railRef.current;
    if (viewport === null || rail === null) return;
    const { scrollTop, scrollHeight, clientHeight } = viewport;
    if (scrollHeight <= clientHeight + 1) {
      setThumb(undefined);
      return;
    }
    const railHeight = rail.clientHeight;
    const height = Math.max(
      MIN_THUMB_PX,
      (clientHeight / scrollHeight) * railHeight
    );
    const maxScroll = scrollHeight - clientHeight;
    setThumb({
      height,
      top: (scrollTop / maxScroll) * (railHeight - height),
    });
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    for (const child of viewport.children) observer.observe(child);
    return () => observer.disconnect();
  }, []);

  function scrollToRatio(ratio: number) {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    viewport.scrollTop =
      ratio * (viewport.scrollHeight - viewport.clientHeight);
  }

  function handleThumbPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerY: event.clientY,
      scrollTop: viewport.scrollTop,
    };
    setDragging(true);
  }

  function handleThumbPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    const rail = railRef.current;
    if (drag === undefined || viewport === null || rail === null) return;
    if (thumb === undefined) return;
    const scale = rail.getBoundingClientRect().height / rail.clientHeight;
    const travel = rail.clientHeight - thumb.height;
    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
    const deltaPx = (event.clientY - drag.pointerY) / scale;
    viewport.scrollTop = drag.scrollTop + (deltaPx / travel) * maxScroll;
  }

  function handleThumbPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = undefined;
    setDragging(false);
  }

  function handleRailPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (rail === null || thumb === undefined) return;
    const box = rail.getBoundingClientRect();
    const scale = box.height / rail.clientHeight;
    const pointerY = (event.clientY - box.top) / scale;
    scrollToRatio(
      (pointerY - thumb.height / 2) / (rail.clientHeight - thumb.height)
    );
  }

  return (
    <div className={cn("relative flex min-h-0 flex-col", props.className)}>
      <div
        ref={viewportRef}
        tabIndex={0}
        onScroll={measure}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-sm [mask-image:linear-gradient(to_bottom,transparent,black_16px,black_calc(100%-24px),transparent)] pr-5 outline-none [scrollbar-width:none] focus-visible:ring-1 focus-visible:ring-[color-mix(in_oklab,var(--lm-ink-pen)_40%,transparent)] [&::-webkit-scrollbar]:hidden"
      >
        {props.children}
      </div>
      <div
        ref={railRef}
        aria-hidden
        onPointerDown={handleRailPointerDown}
        className={cn(
          "group absolute right-0 flex w-3 justify-center transition-opacity duration-300",
          thumb === undefined ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        style={{ top: RAIL_INSET_PX, bottom: RAIL_INSET_PX }}
      >
        <div className="absolute inset-y-0 w-px bg-[color-mix(in_oklab,var(--lm-ink-pen)_14%,transparent)]" />
        {thumb !== undefined && (
          <div
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
            className="absolute flex w-3 cursor-grab touch-none justify-center active:cursor-grabbing"
            style={{ top: thumb.top, height: thumb.height }}
          >
            <div
              className={cn(
                "h-full rounded-full bg-[var(--lm-ink-pen)] transition-[width,opacity] duration-150",
                isDragging
                  ? "w-1.5 opacity-70"
                  : "w-[3px] opacity-40 group-hover:w-1.5 group-hover:opacity-60"
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
