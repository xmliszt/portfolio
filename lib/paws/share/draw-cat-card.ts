import type { CatLook } from "@/lib/paws/cat-look";
import { poseGuideCat } from "@/lib/paws/guide/pose-guide-cat";
import { runGuideTake } from "@/lib/paws/guide/run-guide-take";
import { createSceneResources } from "@/lib/paws/render/create-scene-resources";
import { drawScene } from "@/lib/paws/render/draw-scene";
import type { CreateCanvas } from "@/lib/paws/render/render-types";
import { deriveCat } from "@/lib/paws/sim/derive-cat";

const CAT_ID = "card";
const SPOT = { x: 800, y: 500 };
const SPAN = 440;
const PAPER_SEED = 0.37;

/** Draw a cat with `look` curled up asleep in the middle of a `width` by `height` pixel canvas `g`, on the plain room paper, with scratch canvases from `createCanvas`. */
export function drawCatCard(options: {
  g: CanvasRenderingContext2D;
  createCanvas: CreateCanvas;
  look: CatLook;
  width: number;
  height: number;
}) {
  const { width, height, look } = options;
  const frame = runGuideTake({
    seed: 7,
    loopSeconds: 2,
    span: SPAN,
    camera: { kind: "fixed", ...SPOT },
    cats: [{ userId: CAT_ID, look }],
    setup: (world) =>
      poseGuideCat({
        world,
        userId: CAT_ID,
        at: { ...SPOT, heading: -0.3 },
        then: { kind: "rest", pose: "sleep" },
      }),
  }).at(-1);
  if (frame === undefined) return;
  const scale = width / SPAN;
  drawScene({
    g: options.g,
    width,
    height,
    dpr: 1,
    view: {
      scale,
      offsetX: width / 2 - SPOT.x * scale,
      offsetY: height / 2 - SPOT.y * scale,
    },
    cats: frame.cats.map((snapshot) =>
      deriveCat({ snapshot, look, time: frame.time })
    ),
    prints: [],
    fingers: [],
    time: frame.time,
    resources: createSceneResources({
      createCanvas: options.createCanvas,
      paperSeed: PAPER_SEED,
    }),
  });
}
