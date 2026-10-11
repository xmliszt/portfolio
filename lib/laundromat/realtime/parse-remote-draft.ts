import {
  NOTEBOOK_SCRIPTS,
  type NotebookScript,
} from "@/lib/laundromat/supabase/notebook-types";

import type { RemoteDraft } from "./room-presence";

function isNotebookScript(value: unknown): value is NotebookScript {
  return NOTEBOOK_SCRIPTS.some((script) => script === value);
}

/** Return the draft another tab broadcast with its text cut to `maxChars`, or `undefined` when the payload is not one. */
export function parseRemoteDraft(options: {
  value: unknown;
  maxChars: number;
}): RemoteDraft | undefined {
  const { value } = options;
  if (
    typeof value !== "object" ||
    value === null ||
    !("sessionId" in value && typeof value.sessionId === "string") ||
    !("text" in value && typeof value.text === "string") ||
    !("script" in value && isNotebookScript(value.script))
  ) {
    return undefined;
  }
  return {
    sessionId: value.sessionId,
    text: value.text.slice(0, options.maxChars),
    script: value.script,
  };
}
