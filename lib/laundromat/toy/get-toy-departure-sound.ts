import type { SoundName } from "@/lib/laundromat/audio/sound-names";

import { TOY_DELIVERY_TIMING } from "./toy-delivery-timing";

export function getToyDepartureSound(options: {
  elapsedMs: number;
  reducedMotion: boolean;
}): SoundName | undefined {
  const { elapsedMs, reducedMotion } = options;
  if (reducedMotion) {
    return elapsedMs >= 400 &&
      elapsedMs < TOY_DELIVERY_TIMING.reducedDepartureMs
      ? "toy-thruster"
      : undefined;
  }
  if (elapsedMs >= TOY_DELIVERY_TIMING.departureMs) return undefined;
  if (
    elapsedMs >=
    TOY_DELIVERY_TIMING.packMs +
      TOY_DELIVERY_TIMING.primeMs +
      TOY_DELIVERY_TIMING.hoverMs
  )
    return "toy-box-launch";
  if (elapsedMs >= TOY_DELIVERY_TIMING.packMs + TOY_DELIVERY_TIMING.primeMs)
    return "toy-hover-jets";
  if (elapsedMs >= TOY_DELIVERY_TIMING.packMs) return "toy-thruster";
  return undefined;
}
