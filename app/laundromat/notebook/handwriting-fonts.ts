import {
  Amiri,
  Atma,
  Caveat,
  Klee_One,
  LXGW_WenKai_TC,
  Nanum_Pen_Script,
  Suez_One,
  Tillana,
} from "next/font/google";

import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

const caveat = Caveat({ subsets: ["latin"], weight: "400", preload: false });
const nanumPenScript = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: "400",
  preload: false,
  display: "block",
});
const kleeOne = Klee_One({
  subsets: ["latin"],
  weight: "400",
  preload: false,
  display: "block",
});
// CJK faces load one unicode-range slice per new character, so `block` hides a just-typed glyph for its download instead of flashing it in a system font.
const lxgwWenKai = LXGW_WenKai_TC({
  subsets: ["latin"],
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
  japanese: kleeOne.style.fontFamily,
  chinese: lxgwWenKai.style.fontFamily,
  arabic: amiri.style.fontFamily,
  hebrew: suezOne.style.fontFamily,
  devanagari: tillana.style.fontFamily,
  bengali: atma.style.fontFamily,
} satisfies { [script in NotebookScript]: string };
