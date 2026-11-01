import type { CatLook } from "@/lib/paws/cat-look";
import type { SceneFinger, ScenePrint } from "@/lib/paws/render/render-types";
import type { ToyMarks } from "@/lib/paws/render/toy-marks";
import type { World } from "@/lib/paws/sim/sim-types";
import type { Sky } from "@/lib/paws/sky/sky-types";
import type { CatSnapshot, ToySnapshot, ToyTrail } from "@/lib/paws/wire-types";

/** A scripted fingertip: where it is at take time `t`, or `undefined` while it is away; `own` draws it as the viewer's. */
export type GuideFinger = {
  userId: string;
  own: boolean;
  at: (t: number) => { x: number; y: number; pressed: boolean } | undefined;
};

/** Where a take's view looks: a fixed world point, or the mean of the listed cats and shown fingertips, eased. */
export type GuideCamera =
  | { kind: "fixed"; x: number; y: number }
  | { kind: "follow"; ids: string[] };

/** One looping preview: cats, fingers and directions on a take clock that runs from 0 to `loopSeconds`. */
export type GuideTake = {
  seed: number;
  loopSeconds: number;
  /** World units across the preview's width. */
  span: number;
  camera: GuideCamera;
  cats: { userId: string; look: CatLook }[];
  setup?: (world: World) => void;
  fingers?: GuideFinger[];
  directions?: { at: number; run: (world: World) => void }[];
  /** The sky at take time `t`, for a take that shows the light changing; the plain paper when absent. */
  skyAt?: (t: number) => Sky;
};

/** What one step of a take shows, with print, mark and fingertip times on the take clock. */
export type GuideFrame = {
  cats: CatSnapshot[];
  fingers: SceneFinger[];
  prints: ScenePrint[];
  toys: ToySnapshot[];
  trails: ToyTrail[];
  marks: ToyMarks;
  time: number;
  camera: { x: number; y: number };
};
