import { detectScript } from "@/lib/laundromat/notebook/detect-script";

/** Return the note's font size relative to the Latin size: 0.74 for Korean, Japanese and Chinese, 1 for every other script. */
export function getNoteFontScale(text: string) {
  const script = detectScript(text);
  switch (script) {
    case "korean":
    case "japanese":
    case "chinese":
      return 0.74;
    case "latin":
    case "arabic":
    case "hebrew":
    case "devanagari":
    case "bengali":
      return 1;
    default: {
      const unhandled: never = script;
      return unhandled;
    }
  }
}
