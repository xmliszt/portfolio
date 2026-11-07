/** Return the ids of the active `summaries` followed by `newestId` when it is set and not already listed. */
export function pickRulesCampaignIds(options: {
  summaries: readonly { id: string; isActive: boolean }[];
  newestId: string | undefined;
}) {
  const activeIds = options.summaries
    .filter((summary) => summary.isActive)
    .map((summary) => summary.id);
  return options.newestId === undefined || activeIds.includes(options.newestId)
    ? activeIds
    : [...activeIds, options.newestId];
}
