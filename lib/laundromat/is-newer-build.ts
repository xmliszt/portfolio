/** `true` if the laundromat deployed now runs `deployedBuildId` and it differs from `ownBuildId`; `false` when either is unknown or this tab runs a development build. */
export function isNewerBuild(options: {
  ownBuildId: string | undefined;
  deployedBuildId: string | undefined;
}) {
  const { ownBuildId, deployedBuildId } = options;
  if (ownBuildId === undefined || ownBuildId === "development") return false;
  return deployedBuildId !== undefined && deployedBuildId !== ownBuildId;
}
