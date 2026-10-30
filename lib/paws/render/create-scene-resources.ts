import { createGrainTexture } from "./create-grain-texture";
import { createSurface, type Surface } from "./create-surface";
import type { AnyCanvas, CreateCanvas } from "./render-types";

export type SceneResources = {
  createCanvas: CreateCanvas;
  grain: AnyCanvas;
  /** Paw print masks, made the first time a paw print is drawn. */
  pawMasks: AnyCanvas[] | undefined;
  /** The fingerprint and the scratch canvas it is cut to the pressed area on, made the first time ridges are drawn. */
  ridges: { fingerprint: AnyCanvas; mask: Surface } | undefined;
  /** Paw prints already tinted, by `color:variant`. */
  tintedPrints: { [key: string]: AnyCanvas };
  /** The painted paper and the `width×height@dpr` it was painted for. */
  paper: Surface & { paintedFor: string | undefined };
  /** Scratch canvas each ink wash is graded on before it is printed onto the paper. */
  wash: Surface;
  /** Prints, cats and fingertips, multiplied onto the paper as one ink layer. */
  layer: Surface;
};

/** Return the textures and scratch canvases one scene renderer keeps between frames, made with `createCanvas`. */
export function createSceneResources(options: {
  createCanvas: CreateCanvas;
}): SceneResources {
  const { createCanvas } = options;
  return {
    createCanvas,
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
