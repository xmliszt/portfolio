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
  curtain: {
    rings: number;
    sillClearance: number;
    rodRise: number;
    drop: number;
    stackOutset: number;
    openReach: number;
    closedOverlap: number;
    fabricPerGap: number;
  };
  door: { fromY: number; width: number; height: number; thickness: number };
  clock: { center: IsoPoint; radius: number; depth: number };
  photoFrame: {
    position: IsoPoint;
    size: IsoSize;
    matInset: number;
    photoInset: number;
    nailRise: number;
  };
  bedsideTable: { position: IsoPoint; size: IsoSize };
  lamp: { center: { x: number; y: number }; shadeRadius: number };
  bed: {
    headboard: { position: IsoPoint; size: IsoSize };
    cushions: {
      left: { from: number; to: number };
      right: { from: number; to: number };
    };
    cushionDepth: number;
    cushionBottom: number;
    plinth: { position: IsoPoint; size: IsoSize };
    frame: { position: IsoPoint; size: IsoSize };
    mattress: { position: IsoPoint; size: IsoSize };
    pillows: {
      left: { position: IsoPoint; size: IsoSize };
      right: { position: IsoPoint; size: IsoSize };
    };
    pillowPuff: number;
    duvet: { position: IsoPoint; size: IsoSize };
    cuffDepth: number;
    overhang: number;
    hemZ: number;
    channelGap: number;
    throw: { y: number; d: number; h: number; hemZ: number };
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
      pushCoverMargin: number;
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
    curtain: {
      pullMs: number;
      hemPeriodMs: number;
      hemDampingRatio: number;
    };
    goodNight: {
      trackMs: number;
      landShare: number;
      textMs: number;
      volume: number;
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
  curtain: {
    rings: 6,
    sillClearance: 0.08,
    rodRise: 0.3,
    drop: 0.3,
    stackOutset: 0.36,
    openReach: 0.3,
    closedOverlap: 0.04,
    fabricPerGap: 0.28,
  },
  door: { fromY: 3.3, width: 1.1, height: 2.5, thickness: 0.06 },
  clock: { center: { x: 3.3, y: 0.1, z: 3 }, radius: 0.27, depth: 0.07 },
  photoFrame: {
    position: { x: 5.2, y: 0, z: 1.9 },
    size: { w: 1, d: 0.05, h: 1 },
    matInset: 0.05,
    photoInset: 0.08,
    nailRise: 0.18,
  },
  bedsideTable: {
    position: { x: 3.7, y: 0.08, z: 0 },
    size: { w: 0.62, d: 0.55, h: 0.62 },
  },
  lamp: { center: { x: 4, y: 0.36 }, shadeRadius: 0.25 },
  bed: {
    headboard: {
      position: { x: 4.4, y: 0, z: 0 },
      size: { w: 2.6, d: 0.16, h: 1.36 },
    },
    cushions: {
      left: { from: 4.5, to: 5.66 },
      right: { from: 5.74, to: 6.9 },
    },
    cushionDepth: 0.08,
    cushionBottom: 0.5,
    plinth: {
      position: { x: 4.62, y: 0.3, z: 0 },
      size: { w: 2.26, d: 2.26, h: 0.1 },
    },
    frame: {
      position: { x: 4.48, y: 0.16, z: 0.1 },
      size: { w: 2.52, d: 2.56, h: 0.26 },
    },
    mattress: {
      position: { x: 4.54, y: 0.24, z: 0.36 },
      size: { w: 2.4, d: 2.44, h: 0.24 },
    },
    pillows: {
      left: {
        position: { x: 4.66, y: 0.36, z: 0.6 },
        size: { w: 1.04, d: 0.54, h: 0.26 },
      },
      right: {
        position: { x: 5.8, y: 0.36, z: 0.6 },
        size: { w: 1.04, d: 0.54, h: 0.26 },
      },
    },
    pillowPuff: 0.04,
    duvet: {
      position: { x: 4.54, y: 1.02, z: 0.6 },
      size: { w: 2.4, d: 1.66, h: 0.08 },
    },
    cuffDepth: 0.34,
    overhang: 0.05,
    hemZ: 0.22,
    channelGap: 0.3,
    throw: { y: 2.14, d: 0.44, h: 0.06, hemZ: 0.3 },
  },
  rug: { at: { x: 0.5, y: 2.5 }, width: 3.5, depth: 2.5 },
  lightPool: { at: { x: 3.6, y: 1.1 }, radiusX: 1.3, radiusY: 1.4 },
  basket: {
    center: { x: 6.1, y: 4.5 },
    radius: 0.49,
    baseRadius: 0.43,
    height: 0.69,
  },
  garments: [
    {
      kind: "tee",
      at: { x: 0.9, y: 2.7 },
      rotateDeg: 54,
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
      at: { x: 2.7, y: 4.2 },
      rotateDeg: -17,
      scale: { x: 1, y: 0.95 },
    },
    {
      kind: "towel",
      at: { x: 0.9, y: 4 },
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
      at: { x: 2.4, y: 2.6 },
      rotateDeg: 0,
      scale: { x: 0.9, y: 1 },
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
      pushCoverMargin: 1.1,
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
    curtain: {
      pullMs: 1500,
      hemPeriodMs: 1000,
      hemDampingRatio: 0.4,
    },
    goodNight: {
      trackMs: 86300,
      landShare: 0.92,
      textMs: 3800,
      volume: 0.6,
    },
  },
};
