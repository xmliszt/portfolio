import {
  NOTEBOOK_SCRIPTS,
  type NotebookScript,
} from "@/lib/laundromat/supabase/notebook-types";

import type { DraftSelection, RemoteDraft } from "./room-presence";

function isNotebookScript(value: unknown): value is NotebookScript {
  return NOTEBOOK_SCRIPTS.some((script) => script === value);
}

function parseSelection(options: {
  value: unknown;
  textLength: number;
}): DraftSelection | undefined {
  const { value } = options;
  if (
    typeof value !== "object" ||
    value === null ||
    !("start" in value && Number.isInteger(value.start)) ||
    !("end" in value && Number.isInteger(value.end))
  ) {
    return undefined;
  }
  const clamp = (offset: number) =>
    Math.min(options.textLength, Math.max(0, offset));
  const start = clamp(Number(value.start));
  const end = clamp(Number(value.end));
  return { start: Math.min(start, end), end: Math.max(start, end) };
}

/** Return the draft another tab broadcast with its text cut to `maxChars` and its selection clamped to that text, or `undefined` when the payload is not one; a missing or malformed selection is dropped. */
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
  const text = value.text.slice(0, options.maxChars);
  const selection =
    "selection" in value
      ? parseSelection({ value: value.selection, textLength: text.length })
      : undefined;
  return {
    sessionId: value.sessionId,
    text,
    script: value.script,
    ...(selection === undefined ? {} : { selection }),
  };
}
