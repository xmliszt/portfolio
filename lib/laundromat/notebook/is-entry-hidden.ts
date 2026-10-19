type HideableEntry =
  | { kind: "text"; body: string }
  | { kind: "doodle"; drawing: unknown };

/** Return `true` if a loaded entry was hidden by moderation (a text entry with an empty `body` or a doodle without a `drawing`); `false` when it still shows. */
export function isEntryHidden(entry: HideableEntry) {
  return entry.kind === "text"
    ? entry.body === ""
    : entry.drawing === undefined;
}
