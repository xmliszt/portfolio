import type { MetalTones, TipCoinMetal } from "./tip-coin-metals";
import { METAL_TONES } from "./tip-coin-metals";

/** Return the tones of a `metal` coin's rim and of its field; a bi-metal coin has a brass rim around a silver field. */
export function getCoinTones(metal: TipCoinMetal): {
  ring: MetalTones;
  field: MetalTones;
} {
  return metal === "bimetal"
    ? { ring: METAL_TONES.brass, field: METAL_TONES.silver }
    : { ring: METAL_TONES[metal], field: METAL_TONES[metal] };
}
