/** Return a stable number in [0, 1) for `userId`, from a 32-bit FNV-1a hash. */
export function hashUserId(userId: string) {
  const hash = Array.from(userId).reduce(
    (current, character) => Math.imul(current ^ (character.codePointAt(0) ?? 0), 16777619) >>> 0,
    2166136261
  );
  return hash / 2 ** 32;
}
