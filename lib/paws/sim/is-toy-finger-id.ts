import { getToyFingerId } from "./get-toy-finger-id";

/** `true` if `fingerId` belongs to a toy; `false` when it is a player's finger. */
export function isToyFingerId(fingerId: string) {
  return fingerId.startsWith(getToyFingerId(""));
}
