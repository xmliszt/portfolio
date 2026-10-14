const ENTRY_FIELDS = ["id", "isoDate", "date", "tag", "title", "body"] as const;

export type BoardEntry = {
  id: string;
  isoDate: string;
  date: string;
  tag: string;
  title: string;
  body: string;
};

function isBoardEntry(value: unknown): value is BoardEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    ENTRY_FIELDS.every((field) => typeof Reflect.get(value, field) === "string")
  );
}

/** Return the board entries in a version response body's `updates`, or `undefined` when it has none or any entry is malformed. */
export function parseBoardEntries(value: unknown) {
  if (typeof value !== "object" || value === null || !("updates" in value)) {
    return undefined;
  }
  const { updates } = value;
  return Array.isArray(updates) && updates.every(isBoardEntry)
    ? updates
    : undefined;
}
