import type { CatFrame } from "./cat-to-world";
import type { SimCat } from "./sim-types";

/** Return the position, heading and scale that place `cat`'s local points in the world. */
export function getCatFrame(cat: SimCat): CatFrame {
  return { x: cat.x, y: cat.y, heading: cat.heading, scale: cat.build.scale };
}
