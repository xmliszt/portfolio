"use client";

import { useEffect, useRef } from "react";
import { Instrument_Serif } from "next/font/google";

import { cn } from "@/lib/utils";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400" });

export function SunsetFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    const canvas = canvasRef.current;
    const shade = shadeRef.current;
    const sheet = footer?.previousElementSibling;
    const viewport = footer?.closest<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );
    if (!footer || !canvas || !shade || !viewport) return;
    if (!(sheet instanceof HTMLElement)) return;

    let isDisposed = false;
    let dispose: (() => void) | undefined;
    import("./create-sunset-footer-controller").then((module) => {
      if (isDisposed) return;
      dispose = module.createSunsetFooterController({
        viewport,
        sheet,
        footer,
        canvas,
        shade,
      }).dispose;
    });
    return () => {
      isDisposed = true;
      dispose?.();
    };
  }, []);

  return (
    <footer ref={footerRef} className="sticky bottom-0 z-[1] -mt-8 h-[80svh]">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute bottom-0 left-0 block h-[calc(100%+96px)] w-full bg-[linear-gradient(#5f6680,#c4876c_40%,#f2772d_57%,#1f1f29_57.2%,#0b0e16)]"
      />
      <div
        ref={shadeRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-b-[32px] opacity-0 shadow-[0_14px_36px_rgba(10,6,4,0.45),0_4px_10px_rgba(10,6,4,0.25)] [clip-path:inset(0_-100px_-120px_-100px)]"
      />
      <p
        className={cn(
          instrumentSerif.className,
          "pointer-events-none absolute inset-x-0 top-[14%] px-6 text-center text-[clamp(24px,4vw,40px)] leading-tight text-balance text-[#fff6ec]/90 [text-shadow:0_1px_12px_rgba(60,30,20,0.25)]"
        )}
      >
        chasing the escaping sun...
      </p>
    </footer>
  );
}
