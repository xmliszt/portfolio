import {
  type MarkPoint,
  TOY_MARK_SECONDS,
  type ToyMarks,
} from "@/lib/paws/render/toy-marks";
import type { DerivedCat } from "@/lib/paws/sim/derive-cat";
import { isInPuddle } from "@/lib/paws/sim/is-in-puddle";
import type { ToySnapshot } from "@/lib/paws/wire-types";

const WET_STEPS = 4;
const WET_SECONDS = 10;
const LANDED_HEIGHT = 0.5;
const LIFTED_HEIGHT = 1;

/** Return a tracker of the wet paw prints and ripples the puddles leave, built from the toys and cats one screen draws. */
export function createToyMarks() {
  const state: {
    marks: ToyMarks;
    legHeights: { [legKey: string]: number | undefined };
    wet: { [legKey: string]: { until: number; stepsLeft: number } | undefined };
  } = {
    marks: { wetPrints: [], ripples: [] },
    legHeights: {},
    wet: {},
  };
  return {
    /** Update the marks for `toys` and `cats` at `time` seconds and return them. */
    step: (options: {
      toys: ToySnapshot[];
      cats: DerivedCat[];
      time: number;
    }): ToyMarks => {
      const { toys, cats, time } = options;
      const marks = state.marks;
      const spills = toys.flatMap((toy) =>
        toy.kind === "bowl" && toy.spill !== undefined ? [toy.spill] : []
      );
      const landings = cats.flatMap((cat) =>
        cat.legs.flatMap((leg, index) => {
          const key = `${cat.userId}:${index}`;
          const before = state.legHeights[key];
          state.legHeights[key] = leg.h;
          return before !== undefined &&
            before > LIFTED_HEIGHT &&
            leg.h <= LANDED_HEIGHT
            ? [{ key, x: leg.x, y: leg.y, angle: cat.heading }]
            : [];
        })
      );
      const ripples: MarkPoint[] = [];
      const wetPrints: ToyMarks["wetPrints"] = [];
      for (const landing of landings) {
        if (spills.some((spill) => isInPuddle({ spill, ...landing }))) {
          state.wet[landing.key] = {
            until: time + WET_SECONDS,
            stepsLeft: WET_STEPS,
          };
          ripples.push({ x: landing.x, y: landing.y, bornAt: time });
          continue;
        }
        const wet = state.wet[landing.key];
        if (wet === undefined || wet.stepsLeft <= 0 || time > wet.until)
          continue;
        wet.stepsLeft -= 1;
        wetPrints.push({ ...landing, bornAt: time });
      }
      marks.ripples = [
        ...marks.ripples.filter(
          (ripple) => time - ripple.bornAt < TOY_MARK_SECONDS.ripple
        ),
        ...ripples,
      ];
      marks.wetPrints = [
        ...marks.wetPrints.filter(
          (print) => time - print.bornAt < TOY_MARK_SECONDS.wetPrint
        ),
        ...wetPrints,
      ];
      return marks;
    },
    /** Forget every mark, as when the room changes. */
    reset: () => {
      state.marks = { wetPrints: [], ripples: [] };
      state.legHeights = {};
      state.wet = {};
    },
  };
}
