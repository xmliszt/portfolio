import {
  type Belly,
  type CatLook,
  COAT_INKS,
  type CoatInk,
  PAD_INKS,
} from "@/lib/paws/cat-look";
import { TAIL_SEGMENTS } from "@/lib/paws/sim/derive-cat";
import { hashUnit } from "@/lib/paws/sim/hash-unit";

import { getContrastingInk } from "./get-contrasting-ink";
import { mixHex } from "./mix-hex";

type Four<T> = [T, T, T, T];
type Two<T> = [T, T];

export type CoatPalette = {
  /** Four spine sections, tail end first. */
  spine: Four<string>;
  neck: string;
  head: string;
  cheeks: Two<string>;
  muzzle: string;
  ears: string;
  thighs: Two<string>;
  leg: string;
  lowerLeg: string;
  sock: string;
  /** One colour per tail segment, base first. */
  tail: string[];
  /** The belly patch, or `undefined` for no patch. */
  belly: string | undefined;
  /** Pad colour of each leg in snapshot order. */
  pads: Four<string>;
  nose: string;
};

const WHITE = COAT_INKS.white;
const CREAM_BELLY = "#e9c39f";
const LIGHT_MIX = "#efe1d2";
const COLORPOINT_BODY = "#efe0c8";
const COLORPOINT_DARK = "#5b4033";
const DARK_COATS = new Set<CoatInk>(["black", "charcoal"]);
const LIGHT_COATS = new Set<CoatInk>(["white", "cream", "peach"]);
const MIXED_PADS = [PAD_INKS.pink, PAD_INKS.black, PAD_INKS.mauve];
const MIN_PAD_CONTRAST = 1.5;

const getBellyInk = (belly: Belly, fur: string) => {
  switch (belly) {
    case "cream":
      return CREAM_BELLY;
    case "white":
      return WHITE;
    case "coat":
      return undefined;
    case "light":
      return mixHex({ from: fur, to: LIGHT_MIX, amount: 0.45 });
    default: {
      const unknown: never = belly;
      return unknown;
    }
  }
};

/** Return the colour of every body part, the belly patch and each paw's pads for a cat with `look`; mixed pads are picked per paw from `userId`, among the pad inks that stand out on the paw's `sock`. */
export function getCoatPalette(options: {
  look: CatLook;
  userId: string;
}): CoatPalette {
  const { look, userId } = options;
  const fur = COAT_INKS[look.coat];
  const bellyInk = getBellyInk(look.belly, fur);
  const fixedPad = look.pads === "mixed" ? PAD_INKS.pink : PAD_INKS[look.pads];
  const pads: Four<string> = [fixedPad, fixedPad, fixedPad, fixedPad];
  const nose = look.pads === "mixed" ? PAD_INKS.pink : PAD_INKS[look.pads];
  const tail = (color: (segment: number) => string) =>
    Array.from({ length: TAIL_SEGMENTS }, (_, i) => color(i));
  const solid = (base: string): CoatPalette => ({
    spine: [base, base, base, base],
    neck: base,
    head: base,
    cheeks: [base, base],
    muzzle: bellyInk ?? base,
    ears: base,
    thighs: [base, base],
    leg: base,
    lowerLeg: base,
    sock: bellyInk ?? base,
    tail: tail(() => base),
    belly: bellyInk,
    pads,
    nose,
  });
  const coat: CoatPalette = (() => {
    switch (look.pattern) {
      case "solid":
        return solid(fur);
      case "tabby": {
        const ring = DARK_COATS.has(look.coat)
          ? mixHex({ from: fur, to: "#5a5a6c", amount: 0.4 })
          : mixHex({ from: fur, to: "#2b1d18", amount: 0.16 });
        const band = mixHex({ from: fur, to: ring, amount: 0.5 });
        return {
          ...solid(fur),
          spine: [fur, band, fur, band],
          tail: tail((i) => (i % 2 === 1 ? ring : fur)),
        };
      }
      case "tuxedo": {
        const marks = bellyInk ?? WHITE;
        return { ...solid(fur), belly: marks, muzzle: marks, sock: marks };
      }
      case "calico": {
        const orange = COAT_INKS.ginger;
        const dark =
          look.coat === "ginger" || LIGHT_COATS.has(look.coat)
            ? COAT_INKS.charcoal
            : fur;
        return {
          ...solid(WHITE),
          spine: [dark, WHITE, orange, WHITE],
          neck: orange,
          head: dark,
          cheeks: [orange, WHITE],
          ears: orange,
          thighs: [orange, dark],
          tail: tail(() => dark),
        };
      }
      case "colorpoint": {
        const body = mixHex({ from: fur, to: COLORPOINT_BODY, amount: 0.72 });
        const points = LIGHT_COATS.has(look.coat)
          ? mixHex({ from: fur, to: COLORPOINT_DARK, amount: 0.6 })
          : fur;
        return {
          ...solid(body),
          muzzle: points,
          ears: points,
          lowerLeg: points,
          sock: points,
          tail: tail(() => points),
        };
      }
      default: {
        const unknown: never = look.pattern;
        return unknown;
      }
    }
  })();
  if (look.pads !== "mixed") return coat;
  const standOut = MIXED_PADS.filter(
    (ink) =>
      getContrastingInk({
        ink,
        background: coat.sock,
        minContrast: MIN_PAD_CONTRAST,
      }) === ink
  );
  const inks = standOut.length > 0 ? standOut : MIXED_PADS;
  const padInk = (leg: number) =>
    inks[Math.floor(hashUnit(`${userId}:${leg}`) * inks.length)];
  return { ...coat, pads: [padInk(0), padInk(1), padInk(2), padInk(3)] };
}
