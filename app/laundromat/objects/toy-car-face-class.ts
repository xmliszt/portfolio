import type { ToyFaceTone } from "@/lib/laundromat/toy/get-toy-face-tone";
import type { ToyCarPart } from "@/lib/laundromat/toy/toy-car-mesh";

const BODY_FILLS = {
  top: "fill-[color-mix(in_srgb,var(--lm-ink-hi)_62%,var(--lm-face-top))]",
  face: "fill-[color-mix(in_srgb,var(--lm-ink-hi)_50%,var(--lm-face))]",
  "shade-2": "fill-[color-mix(in_srgb,var(--lm-ink-hi)_44%,var(--lm-face))]",
  "shade-1": "fill-[color-mix(in_srgb,var(--lm-ink-hi)_38%,var(--lm-wall))]",
  wall: "fill-[color-mix(in_srgb,var(--lm-ink-hi)_32%,var(--lm-wall))]",
} satisfies { [tone in ToyFaceTone]: string };

/** Return the fill class for a toy car face: the white paint in `tone`, dark glass and tyres, grey hubs, the red tail light and white headlights. */
export function toyCarFaceClass(options: {
  part: ToyCarPart;
  tone: ToyFaceTone;
}) {
  switch (options.part) {
    case "body":
      return BODY_FILLS[options.tone];
    case "glass":
      return "fill-[var(--lm-recess)]";
    case "tyre":
      return "fill-[var(--lm-bg)]";
    case "hub":
      return "fill-[var(--lm-ink)]";
    case "tail":
      return "fill-[var(--lm-toy-light)] stroke-none";
    case "head":
      return "fill-[var(--lm-ink-hi)] stroke-none";
    default: {
      const unhandled: never = options.part;
      return unhandled;
    }
  }
}
