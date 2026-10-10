import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

/** Return `true` if `script` is written right to left; `false` when it runs left to right. */
export function isRtlScript(script: NotebookScript) {
  return script === "arabic" || script === "hebrew";
}
