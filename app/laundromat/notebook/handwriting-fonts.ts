import {
  Amiri,
  Atma,
  Caveat,
  Nanum_Pen_Script,
  Suez_One,
  Tillana,
  Zen_Kurenaido,
} from "next/font/google";
import localFont from "next/font/local";

import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

const caveat = Caveat({ subsets: ["latin"], weight: "400", preload: false });
const nanumPenScript = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: "400",
  preload: false,
  display: "block",
});
const zenKurenaido = Zen_Kurenaido({
  subsets: ["latin"],
  weight: "400",
  preload: false,
  display: "block",
});
// The whole 4.6 MB face downloads with the first Chinese note, so `block` hides it for the download instead of flashing it in a system font.
const zhibi = localFont({
  src: "./zhibi.woff2",
  weight: "400",
  preload: false,
  display: "block",
});
const amiri = Amiri({ subsets: ["arabic"], weight: "400", preload: false });
const suezOne = Suez_One({
  subsets: ["hebrew"],
  weight: "400",
  preload: false,
});
const tillana = Tillana({
  subsets: ["devanagari"],
  weight: "400",
  preload: false,
});
const atma = Atma({ subsets: ["bengali"], weight: "400", preload: false });

export const HANDWRITING_FONT_FAMILIES = {
  latin: caveat.style.fontFamily,
  korean: nanumPenScript.style.fontFamily,
  japanese: zenKurenaido.style.fontFamily,
  chinese: zhibi.style.fontFamily,
  arabic: amiri.style.fontFamily,
  hebrew: suezOne.style.fontFamily,
  devanagari: tillana.style.fontFamily,
  bengali: atma.style.fontFamily,
} satisfies { [script in NotebookScript]: string };
