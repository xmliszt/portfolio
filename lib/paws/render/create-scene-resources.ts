import { createGrainTexture } from "./create-grain-texture";
import { createSurface, type Surface } from "./create-surface";
import type { AnyCanvas, CreateCanvas } from "./render-types";

export type SceneResources = {
  createCanvas: CreateCanvas;
  grain: AnyCanvas;
  /** Paw print masks, made the first time a paw print is drawn. */
  pawMasks: AnyCanvas[] | undefined;
  /** Each fingerprint pattern, made the first time it is drawn, and the scratch canvas a print is cut and inked on. */
  ridges:
    | { fingerprints: (AnyCanvas | undefined)[]; mask: Surface }
    | undefined;
  /** Paw prints already tinted, by `color:variant`. */
  tintedPrints: { [key: string]: AnyCanvas };
  /** Picks where the paper's palettes start, from 0 to 1. */
  paperSeed: number;
  /** The painted paper and the `width×height@dpr#step` it was painted for. */
  paper: Surface & { paintedFor: string | undefined };
  /** Scratch canvas each ink wash is graded on before it is printed onto the paper. */
  wash: Surface;
  /** Prints, cats and fingertips, multiplied onto the paper as one ink layer. */
  layer: Surface;
};

/** Return the textures and scratch canvases one scene renderer keeps between frames, made with `createCanvas`, with the paper's palettes starting from `paperSeed`. */
export function createSceneResources(options: {
  createCanvas: CreateCanvas;
  paperSeed: number;
}): SceneResources {
  const { createCanvas } = options;
  return {
    createCanvas,
    paperSeed: options.paperSeed,
    grain: createGrainTexture({ createCanvas }),
    pawMasks: undefined,
    ridges: undefined,
    tintedPrints: {},
    paper: {
      ...createSurface({ createCanvas, width: 1, height: 1 }),
      paintedFor: undefined,
    },
    wash: createSurface({ createCanvas, width: 1, height: 1 }),
    layer: createSurface({ createCanvas, width: 1, height: 1 }),
  };
}
