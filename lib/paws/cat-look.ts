export const COAT_INKS = {
  ginger: "#ea7034",
  cinnamon: "#b8643a",
  chocolate: "#7d5c3e",
  cream: "#e6cfac",
  peach: "#e2a98f",
  white: "#dccfc6",
  lilac: "#a99bb0",
  blueGrey: "#8794a8",
  charcoal: "#2f3140",
  black: "#26262f",
} as const;

export const PATTERNS = ["solid", "tabby", "tuxedo", "calico", "colorpoint"] as const;
export const BELLIES = ["cream", "white", "coat", "light"] as const;
export const PAD_INKS = {
  pink: "#e2758f",
  black: "#3a2f35",
  mauve: "#b07a95",
  mixed: "mixed",
} as const;
export const STEPS = ["small", "medium", "large"] as const;

export type CoatInk = keyof typeof COAT_INKS;
export type Pattern = (typeof PATTERNS)[number];
export type Belly = (typeof BELLIES)[number];
export type PadInk = keyof typeof PAD_INKS;
export type Step = (typeof STEPS)[number];

export type CatLook = {
  coat: CoatInk;
  pattern: Pattern;
  belly: Belly;
  pads: PadInk;
  size: Step;
  fluff: Step;
  tail: Step;
  ears: Step;
};
