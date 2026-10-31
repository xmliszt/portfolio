import { WIRE_LIMITS } from "./wire-limits";

/** Return `value` when it is a non-empty string no longer than `WIRE_LIMITS.maxIdLength`, or `undefined` otherwise. */
export function parseWireId(value: unknown) {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= WIRE_LIMITS.maxIdLength
    ? value
    : undefined;
}
