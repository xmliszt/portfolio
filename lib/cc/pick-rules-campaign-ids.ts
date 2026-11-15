/** Return the ids of the active `summaries` followed by `newestId` when it is set, not already listed and not ended. */
export function pickRulesCampaignIds(options: {
  summaries: readonly { id: string; isActive: boolean; isEnded: boolean }[];
  newestId: string | undefined;
}) {
  const activeIds = options.summaries
    .filter((summary) => summary.isActive)
    .map((summary) => summary.id);
  const isNewestEnded = options.summaries.some(
    (summary) => summary.id === options.newestId && summary.isEnded
  );
  return options.newestId === undefined ||
    isNewestEnded ||
    activeIds.includes(options.newestId)
    ? activeIds
    : [...activeIds, options.newestId];
}
