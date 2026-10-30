import type { CatLook } from "@/lib/paws/cat-look";
import { getCatBuild } from "@/lib/paws/sim/get-cat-build";
import { hashUnit } from "@/lib/paws/sim/hash-unit";
import type { RoomEvent } from "@/lib/paws/wire-types";

import { getCoatPalette } from "./get-coat-palette";
import { PAW_PRINT_BOX } from "./paw-print-box";
import type { ScenePrint } from "./render-types";

/** Return the print `event` leaves on the glass at `time` seconds, coloured by the look of the cat that made it, or `undefined` for sounds and for paw or nose prints of a cat whose `look` is unknown. */
export function toScenePrint(options: {
  event: RoomEvent;
  look: CatLook | undefined;
  time: number;
}): ScenePrint | undefined {
  const { event, look, time } = options;
  switch (event.kind) {
    case "sound":
      return undefined;
    case "fingerPrint":
      return {
        kind: "finger",
        x: event.x,
        y: event.y,
        pressure: event.pressure,
        bornAt: time,
      };
    case "pawPrint": {
      if (look === undefined) return undefined;
      const palette = getCoatPalette({ look, userId: event.userId });
      return {
        kind: "paw",
        x: event.x,
        y: event.y,
        angle: event.angle,
        scale: getCatBuild(look).scale,
        color: palette.pads[event.leg] ?? palette.pads[0],
        variant: Math.floor(
          hashUnit(
            `${event.userId}:${Math.round(event.x)}:${Math.round(event.y)}`
          ) * PAW_PRINT_BOX.variants
        ),
        bornAt: time,
      };
    }
    case "nosePrint": {
      if (look === undefined) return undefined;
      return {
        kind: "nose",
        x: event.x,
        y: event.y,
        angle: event.angle,
        scale: getCatBuild(look).scale,
        color: getCoatPalette({ look, userId: event.userId }).nose,
        bornAt: time,
      };
    }
    default: {
      const unknown: never = event;
      return unknown;
    }
  }
}
