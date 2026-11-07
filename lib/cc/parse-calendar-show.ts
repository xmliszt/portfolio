/** Return the ids in the comma-separated `value` that are in `optionIds`, in `optionIds` order, or every one of `optionIds` when `value` is unset or names none of them. */
export function parseCalendarShow(options: {
  value: string | undefined;
  optionIds: readonly string[];
}) {
  const requested = new Set(options.value?.split(",") ?? []);
  const selected = options.optionIds.filter((id) => requested.has(id));
  return selected.length === 0 ? [...options.optionIds] : selected;
}
