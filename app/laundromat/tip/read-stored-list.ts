/** Return the items of the JSON array stored under `key` that pass `isItem`, or an empty list when nothing readable is stored. */
export function readStoredList<Item>(options: {
  key: string;
  isItem: (value: unknown) => value is Item;
}): Item[] {
  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(options.key) ?? "[]"
    );
    return Array.isArray(stored) ? stored.filter(options.isItem) : [];
  } catch {
    return [];
  }
}
