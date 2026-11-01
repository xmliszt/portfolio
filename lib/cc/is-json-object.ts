/** `true` if `value` is a plain object such as `JSON.parse` returns; `false` for arrays, `null` and other values. */
export function isJsonObject(
  value: unknown
): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
