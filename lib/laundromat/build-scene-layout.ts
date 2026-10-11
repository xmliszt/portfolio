import type { CoffeeControl } from "./coffee/describe-coffee-switch";
import type { MachineControl } from "./laundry/describe-machine-control";
import type { TvControl } from "./tv/describe-tv-control";
import { getBoxFaces } from "./get-box-faces";
import { getCoffeeMachineFace } from "./get-coffee-machine-face";
import { getMachineFace } from "./get-machine-face";
import { getTvFace } from "./get-tv-face";
import type { IsoProjection, ScreenPoint } from "./project-iso-point";
import { projectIsoPoint } from "./project-iso-point";
import type { SceneConfig, SceneObject } from "./scene-config";
import { sortByDepth } from "./sort-by-depth";

const MACHINE_CONTROLS = ["dial", "start", "door"] satisfies MachineControl[];
const TV_CONTROLS = [
  "screen",
  "tuner",
  "volume",
  "power",
] satisfies TvControl[];
const COFFEE_CONTROLS = ["switch", "flask"] satisfies CoffeeControl[];

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);

export type ScreenBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SceneLayout = ReturnType<typeof buildSceneLayout>;

export type LaidOutObject = SceneLayout["objects"][number];

export type LaidOutControl = {
  id: string;
  outline: ScreenPoint[];
  bounds: ScreenBounds;
} & (
  | { target: "machine"; control: MachineControl }
  | { target: "tv"; control: TvControl }
  | { target: "coffee"; control: CoffeeControl }
);

function getBounds(points: ScreenPoint[]): ScreenBounds {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

type ObjectFace =
  | ({ target: "machine" } & ReturnType<typeof getMachineFace>)
  | ({ target: "tv" } & ReturnType<typeof getTvFace>)
  | ({ target: "coffee" } & ReturnType<typeof getCoffeeMachineFace>);

function getFace(options: {
  object: SceneObject;
  projection: IsoProjection;
}): ObjectFace | undefined {
  const { object, projection } = options;
  const placement = {
    position: object.position,
    size: object.size,
    projection,
  };
  switch (object.kind) {
    case "washer":
    case "dryer":
      return {
        target: "machine",
        ...getMachineFace({ kind: object.kind, ...placement }),
      };
    case "tv":
      return { target: "tv", ...getTvFace(placement) };
    case "coffee-machine":
      return {
        target: "coffee",
        ...getCoffeeMachineFace(placement),
      };
    default:
      return undefined;
  }
}

function getControls(options: {
  objectId: string;
  face: ObjectFace | undefined;
}): LaidOutControl[] {
  const { face, objectId } = options;
  function toControl(control: string, outline: ScreenPoint[]) {
    return {
      id: `${objectId}-${control}`,
      outline,
      bounds: getBounds(outline),
    };
  }
  switch (face?.target) {
    case undefined:
      return [];
    case "machine":
      return MACHINE_CONTROLS.map((control) => ({
        target: face.target,
        control,
        ...toControl(control, face.controlOutlines[control]),
      }));
    case "tv":
      return TV_CONTROLS.map((control) => ({
        target: face.target,
        control,
        ...toControl(control, face.controlOutlines[control]),
      }));
    case "coffee":
      return COFFEE_CONTROLS.map((control) => ({
        target: face.target,
        control,
        ...toControl(control, face.controlOutlines[control]),
      }));
    default: {
      const unhandled: never = face;
      return unhandled;
    }
  }
}

/** Project the room and every object in `config` into scene pixels at `unit` pixels per iso unit, objects in paint order. */
export function buildSceneLayout(options: {
  config: SceneConfig;
  unit: number;
}) {
  const { width, depth, wallHeight } = options.config.room;
  const { unit } = options;
  const projection: IsoProjection = {
    unit,
    origin: { x: depth * COS_30 * unit, y: wallHeight * unit },
  };
  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  const gridLines = [
    ...Array.from({ length: width - 1 }, (_, index) => ({
      from: at(index + 1, 0, 0),
      to: at(index + 1, depth, 0),
    })),
    ...Array.from({ length: depth - 1 }, (_, index) => ({
      from: at(0, index + 1, 0),
      to: at(width, index + 1, 0),
    })),
  ];
  return {
    size: {
      width: (width + depth) * COS_30 * unit,
      height: (width + depth) * SIN_30 * unit + wallHeight * unit,
    },
    floor: [at(0, 0, 0), at(width, 0, 0), at(width, depth, 0), at(0, depth, 0)],
    backWall: [
      at(0, 0, 0),
      at(width, 0, 0),
      at(width, 0, wallHeight),
      at(0, 0, wallHeight),
    ],
    leftWall: [
      at(0, 0, 0),
      at(0, depth, 0),
      at(0, depth, wallHeight),
      at(0, 0, wallHeight),
    ],
    projection,
    gridLines,
    objects: sortByDepth(options.config.objects).map((object) => {
      const faces = getBoxFaces({
        position: object.position,
        size: object.size,
        projection,
      });
      const face = getFace({ object, projection });
      return {
        object,
        faces,
        bounds: getBounds(faces.outline),
        face,
        controls: getControls({ objectId: object.id, face }),
      };
    }),
  };
}
