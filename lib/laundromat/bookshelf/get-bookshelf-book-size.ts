function hashId(id: number) {
  let hash = 2166136261;
  for (const char of `book-${id}`) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Return the world-unit size of book `id`, how far its spine sits back from the others, and how it is bound and tinted, the same for the same id every time. */
export function getBookshelfBookSize(id: number) {
  const hash = hashId(id);
  return {
    thickness: 0.14 + (hash % 11) / 100,
    height: 0.8 + ((hash >>> 4) % 24) / 100,
    depth: 0.56 + ((hash >>> 9) % 18) / 100,
    setback: ((hash >>> 14) % 5) / 100,
    isHardcover: (hash >>> 17) % 3 !== 0,
    toneIndex: (hash >>> 20) % 5,
    hue: (hash >>> 3) % 360,
  };
}
