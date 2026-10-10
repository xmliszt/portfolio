import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

const SCRIPT_PATTERNS = [
  { script: "korean", pattern: /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/ },
  { script: "japanese", pattern: /[\u3040-\u30ff\u31f0-\u31ff]/ },
  { script: "chinese", pattern: /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/ },
  { script: "arabic", pattern: /[\u0600-\u06ff\u0750-\u077f\ufb50-\ufdff\ufe70-\ufeff]/ },
  { script: "hebrew", pattern: /[\u0590-\u05ff\ufb1d-\ufb4f]/ },
  { script: "devanagari", pattern: /[\u0900-\u097f]/ },
  { script: "bengali", pattern: /[\u0980-\u09ff]/ },
] satisfies { script: NotebookScript; pattern: RegExp }[];

/** Return the handwriting script for `text`: the first non-Latin script it contains, checking kana before Han so Japanese with kanji reads as Japanese, else `"latin"`. */
export function detectScript(text: string): NotebookScript {
  return (
    SCRIPT_PATTERNS.find(({ pattern }) => pattern.test(text))?.script ?? "latin"
  );
}
