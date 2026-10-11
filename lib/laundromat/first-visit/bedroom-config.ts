import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";

export type GarmentKind =
  | "tee"
  | "jeans"
  | "sweater"
  | "towel"
  | "socks"
  | "shirt";

export type Garment = {
  kind: GarmentKind;
  at: { x: number; y: number };
  rotateDeg: number;
  scale: { x: number; y: number };
};

export type BedroomConfig = {
  stage: { width: number; height: number };
  projection: { unit: number; origin: { x: number; y: number } };
  room: { width: number; depth: number; wallHeight: number };
  window: { position: IsoPoint; size: IsoSize };
  door: { fromY: number; width: number; height: number; thickness: number };
  clock: { center: IsoPoint; radius: number; depth: number };
  bedsideTable: { position: IsoPoint; size: IsoSize };
  lamp: { center: { x: number; y: number }; shadeRadius: number };
  bed: {
    headboard: { position: IsoPoint; size: IsoSize };
    frame: { position: IsoPoint; size: IsoSize };
    mattress: { position: IsoPoint; size: IsoSize };
    pillow: { position: IsoPoint; size: IsoSize };
    blanket: { position: IsoPoint; size: IsoSize };
  };
  rug: { at: { x: number; y: number }; width: number; depth: number };
  lightPool: { at: { x: number; y: number }; radiusX: number; radiusY: number };
  basket: {
    center: { x: number; y: number };
    radius: number;
    baseRadius: number;
    height: number;
  };
  garments: Garment[];
  motion: {
    hoverLiftPx: number;
    crumpleMs: number;
    dropMs: number;
    flightMinMs: number;
    flightMaxMs: number;
    settleMs: number;
    landMs: number;
    basketBumpMs: number;
    nudge: {
      firstMs: number;
      gapMs: number;
      gapJitterMs: number;
      retryMs: number;
      idleResetMs: number;
      maxCount: number;
      durationMs: number;
      liftPx: number;
      tiltDeg: number;
    };
    walkIn: {
      leverMs: number;
      openDeg: number;
      springOmega: number;
      pushStartMs: number;
      pushMs: number;
      pushScale: number;
      pushBlurPx: number;
      pushBlurDelayMs: number;
      pushBlurMs: number;
      lightInMs: number;
      whiteMs: number;
      lightOutMs: number;
      arriveMs: number;
      arriveFromScale: number;
      arriveBlurPx: number;
      reducedFadeMs: number;
    };
  };
};

export const bedroomConfig: BedroomConfig = {
  stage: { width: 1440, height: 900 },
  projection: { unit: 62, origin: { x: 680, y: 380 } },
  room: { width: 7, depth: 5.5, wallHeight: 4 },
  window: {
    position: { x: 0, y: 0.55, z: 1.5 },
    size: { w: 0.28, d: 2, h: 2 },
  },
  door: { fromY: 3, width: 1.1, height: 2.5, thickness: 0.06 },
  clock: { center: { x: 3.3, y: 0.1, z: 3 }, radius: 0.27, depth: 0.07 },
  bedsideTable: {
    position: { x: 3.7, y: 0.08, z: 0 },
    size: { w: 0.62, d: 0.55, h: 0.62 },
  },
  lamp: { center: { x: 4, y: 0.36 }, shadeRadius: 0.21 },
  bed: {
    headboard: {
      position: { x: 4.4, y: 0, z: 0 },
      size: { w: 2.6, d: 0.14, h: 1.2 },
    },
    frame: {
      position: { x: 4.5, y: 0.14, z: 0 },
      size: { w: 2.5, d: 2.6, h: 0.32 },
    },
    mattress: {
      position: { x: 4.5, y: 0.18, z: 0.32 },
      size: { w: 2.4, d: 2.5, h: 0.26 },
    },
    pillow: {
      position: { x: 4.8, y: 0.3, z: 0.58 },
      size: { w: 1.9, d: 0.55, h: 0.16 },
    },
    blanket: {
      position: { x: 4.5, y: 1, z: 0.34 },
      size: { w: 2.4, d: 1.7, h: 0.28 },
    },
  },
  rug: { at: { x: 1.8, y: 2.6 }, width: 3.4, depth: 2.5 },
  lightPool: { at: { x: 3.4, y: 1.2 }, radiusX: 1.7, radiusY: 1.3 },
  basket: {
    center: { x: 3.2, y: 1.8 },
    radius: 0.5,
    baseRadius: 0.42,
    height: 0.66,
  },
  garments: [
    {
      kind: "tee",
      at: { x: 2.3, y: 3 },
      rotateDeg: 18,
      scale: { x: 1, y: 0.95 },
    },
    {
      kind: "jeans",
      at: { x: 3.9, y: 3.5 },
      rotateDeg: -41,
      scale: { x: 0.78, y: 1.3 },
    },
    {
      kind: "sweater",
      at: { x: 3.1, y: 4.8 },
      rotateDeg: -8,
      scale: { x: 1.3, y: 0.95 },
    },
    {
      kind: "towel",
      at: { x: 5.8, y: 3.8 },
      rotateDeg: 32,
      scale: { x: 0.95, y: 0.58 },
    },
    {
      kind: "socks",
      at: { x: 1.6, y: 5 },
      rotateDeg: 40,
      scale: { x: 0.55, y: 0.55 },
    },
    {
      kind: "shirt",
      at: { x: 5.2, y: 5 },
      rotateDeg: 12,
      scale: { x: 1.1, y: 1 },
    },
  ],
  motion: {
    hoverLiftPx: 3,
    crumpleMs: 180,
    dropMs: 300,
    flightMinMs: 520,
    flightMaxMs: 780,
    settleMs: 340,
    landMs: 300,
    basketBumpMs: 340,
    nudge: {
      firstMs: 5000,
      gapMs: 7000,
      gapJitterMs: 1500,
      retryMs: 3000,
      idleResetMs: 6000,
      maxCount: 4,
      durationMs: 1400,
      liftPx: 4,
      tiltDeg: 1.4,
    },
    walkIn: {
      leverMs: 140,
      openDeg: 84,
      springOmega: 7,
      pushStartMs: 520,
      pushMs: 1200,
      pushScale: 5,
      pushBlurPx: 10,
      pushBlurDelayMs: 300,
      pushBlurMs: 850,
      lightInMs: 900,
      whiteMs: 450,
      lightOutMs: 1000,
      arriveMs: 1350,
      arriveFromScale: 1.1,
      arriveBlurPx: 14,
      reducedFadeMs: 400,
    },
  },
};
