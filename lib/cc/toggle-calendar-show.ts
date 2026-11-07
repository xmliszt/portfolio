/** Return `selectedIds` with `optionId` turned off when it is on, or on when it is off, in `optionIds` order. */
export function toggleCalendarShow(options: {
  optionIds: readonly string[];
  selectedIds: readonly string[];
  optionId: string;
}) {
  const isOn = options.selectedIds.includes(options.optionId);
  return options.optionIds.filter((id) =>
    id === options.optionId ? !isOn : options.selectedIds.includes(id)
  );
}
