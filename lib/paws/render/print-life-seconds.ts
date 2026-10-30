import type { ScenePrint } from "./render-types";

/** How long each kind of print takes to fade away, in seconds. */
export const PRINT_LIFE_SECONDS = {
  paw: 4,
  nose: 5,
  finger: 3.5,
} as const satisfies { [kind in ScenePrint["kind"]]: number };
