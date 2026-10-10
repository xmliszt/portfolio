import { getBoxFaces } from "./get-box-faces";
import { getMachineFace } from "./get-machine-face";
import type { IsoProjection, ScreenPoint } from "./project-iso-point";
import { projectIsoPoint } from "./project-iso-point";
import type { SceneConfig } from "./scene-config";
import { sortByDepth } from "./sort-by-depth";

const MACHINE_CONTROLS = ["dial", "start", "door"] as const;

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

function getBounds(points: ScreenPoint[]): ScreenBounds {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
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
      const machineFace =
        object.kind === "washer" || object.kind === "dryer"
          ? getMachineFace({
              position: object.position,
              size: object.size,
              projection,
            })
          : undefined;
      const controls =
        machineFace === undefined
          ? []
          : MACHINE_CONTROLS.map((control) => {
              const outline = machineFace.controlOutlines[control];
              return {
                id: `${object.id}-${control}`,
                control,
                outline,
                bounds: getBounds(outline),
              };
            });
      return {
        object,
        faces,
        bounds: getBounds(faces.outline),
        machineFace,
        controls,
      };
    }),
  };
}
