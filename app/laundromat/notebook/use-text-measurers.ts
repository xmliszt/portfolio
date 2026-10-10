"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

import { HANDWRITING_FONT_FAMILIES } from "./handwriting-fonts";

export type Measure = (text: string) => number;

type MeasurerKey = { script: NotebookScript; fontSizePx: number };

function toFont(options: MeasurerKey) {
  return `${options.fontSizePx}px ${HANDWRITING_FONT_FAMILIES[options.script]}`;
}

function toKey(options: MeasurerKey) {
  return `${options.script}:${options.fontSizePx}`;
}

function createMeasure(font: string): Measure {
  const context = document.createElement("canvas").getContext("2d");
  if (context === null) return (text) => Array.from(text).length * 10;
  context.font = font;
  return (text) => context.measureText(text).width;
}

/** Return canvas text measurers per handwriting script and size, re-created whenever a font file finishes loading so widths always use the real glyphs. */
export function useTextMeasurers() {
  const [fontsVersion, setFontsVersion] = useState(0);
  const cacheRef = useRef<{ [key: string]: Measure }>({});

  useEffect(() => {
    function handleLoadingDone() {
      setFontsVersion((version) => version + 1);
    }
    document.fonts.addEventListener("loadingdone", handleLoadingDone);
    return () =>
      document.fonts.removeEventListener("loadingdone", handleLoadingDone);
  }, []);

  const getMeasure = useCallback(
    (options: MeasurerKey) => {
      const key = `${toKey(options)}:${fontsVersion}`;
      const cached = cacheRef.current[key];
      if (cached !== undefined) return cached;
      const measure = createMeasure(toFont(options));
      cacheRef.current[key] = measure;
      return measure;
    },
    [fontsVersion]
  );

  const loadMeasure = useCallback(
    async (options: MeasurerKey & { text: string }) => {
      const font = toFont(options);
      await document.fonts.load(font, options.text).catch(() => []);
      return createMeasure(font);
    },
    []
  );

  return { getMeasure, loadMeasure };
}
