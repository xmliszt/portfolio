import { maskProfanity } from "@/lib/laundromat/notebook/mask-profanity";
import {
  NOTEBOOK_SCRIPTS,
  type NotebookScript,
} from "@/lib/laundromat/supabase/notebook-types";

import type { RemoteEntry } from "./room-presence";

function isNotebookScript(value: unknown): value is NotebookScript {
  return NOTEBOOK_SCRIPTS.some((script) => script === value);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

/** Return the entry another tab broadcast right after saving it, with its body cut to `maxChars` and swear words masked in its body and sign-off, or `undefined` when the payload is not one. */
export function parseRemoteEntry(options: {
  value: unknown;
  maxChars: number;
}): RemoteEntry | undefined {
  const { value } = options;
  if (
    typeof value !== "object" ||
    value === null ||
    !("sessionId" in value && typeof value.sessionId === "string") ||
    !("notebookNumber" in value && isPositiveInteger(value.notebookNumber)) ||
    !("entry" in value) ||
    typeof value.entry !== "object" ||
    value.entry === null
  ) {
    return undefined;
  }
  const { entry } = value;
  if (
    !("id" in entry && isPositiveInteger(entry.id)) ||
    !("page" in entry && isPositiveInteger(entry.page)) ||
    !("lineStart" in entry && isPositiveInteger(entry.lineStart)) ||
    !("lineCount" in entry && isPositiveInteger(entry.lineCount)) ||
    !("body" in entry && typeof entry.body === "string") ||
    !(
      "signOff" in entry &&
      (entry.signOff === null || typeof entry.signOff === "string")
    ) ||
    !("script" in entry && isNotebookScript(entry.script)) ||
    !("createdAt" in entry && typeof entry.createdAt === "string") ||
    Number.isNaN(Date.parse(entry.createdAt))
  ) {
    return undefined;
  }
  return {
    sessionId: value.sessionId,
    notebookNumber: value.notebookNumber,
    entry: {
      id: entry.id,
      page: entry.page,
      lineStart: entry.lineStart,
      lineCount: entry.lineCount,
      body: maskProfanity(entry.body.slice(0, options.maxChars)),
      signOff: entry.signOff === null ? null : maskProfanity(entry.signOff),
      script: entry.script,
      createdAt: entry.createdAt,
    },
  };
}
