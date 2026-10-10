import type { TegakiBundle } from "tegaki";

import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

/** Import the tegaki stroke bundle for `script`, so only the scripts a reader meets are downloaded. */
export async function loadTegakiFont(
  script: NotebookScript
): Promise<TegakiBundle> {
  switch (script) {
    case "latin":
      return (await import("tegaki/fonts/caveat")).default;
    case "korean":
      return (await import("tegaki/fonts/nanum-pen-script")).default;
    case "japanese":
      return (await import("tegaki/fonts/klee-one")).default;
    case "chinese":
      return (await import("tegaki/fonts/lxgw-wenkai")).default;
    case "arabic":
      return (await import("tegaki/fonts/amiri")).default;
    case "hebrew":
      return (await import("tegaki/fonts/suez-one")).default;
    case "devanagari":
      return (await import("tegaki/fonts/tillana")).default;
    case "bengali":
      return (await import("tegaki/fonts/atma")).default;
    default: {
      const unhandled: never = script;
      return unhandled;
    }
  }
}
