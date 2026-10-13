/** Return the `buildId` string in a version response body, or `undefined` when the body has none. */
export function parseBuildId(value: unknown) {
  return typeof value === "object" &&
    value !== null &&
    "buildId" in value &&
    typeof value.buildId === "string"
    ? value.buildId
    : undefined;
}
