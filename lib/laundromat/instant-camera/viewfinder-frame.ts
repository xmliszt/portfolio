export type ViewfinderOrientation = "portrait" | "landscape";

export type ViewfinderFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ViewfinderCorner =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type ViewportSize = { width: number; height: number };

/** Width over height of the photo in each orientation: 3:4 upright, 4:3 on its side. */
export const VIEWFINDER_RATIO = {
  portrait: 3 / 4,
  landscape: 4 / 3,
} as const satisfies { [orientation in ViewfinderOrientation]: number };
