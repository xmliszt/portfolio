export type TipCoinMetal = "copper" | "silver" | "brass" | "bimetal";

export type MetalTones = {
  light: string;
  base: string;
  dark: string;
  edge: string;
};

export const METAL_TONES = {
  copper: {
    light: "#ffd9bd",
    base: "#c8794a",
    dark: "#7c3d1e",
    edge: "#4f240f",
  },
  silver: {
    light: "#ffffff",
    base: "#b9c0c8",
    dark: "#69717b",
    edge: "#3e444b",
  },
  brass: {
    light: "#fff1c2",
    base: "#dcab4c",
    dark: "#8f6118",
    edge: "#5a3a0a",
  },
} satisfies { [metal in Exclude<TipCoinMetal, "bimetal">]: MetalTones };

export const COIN_METALS: { [cents: number]: TipCoinMetal } = {
  100: "copper",
  200: "silver",
  500: "brass",
  1000: "bimetal",
};
