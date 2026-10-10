import {
  NOTEBOOK_SCRIPTS,
  NotebookScript,
} from "@/lib/laundromat/supabase/notebook-types";

/** Return `value` as a `NotebookScript`, or `"latin"` when it is not one. */
export function toNotebookScript(value: string): NotebookScript {
  return NOTEBOOK_SCRIPTS.find((script) => script === value) ?? "latin";
}
