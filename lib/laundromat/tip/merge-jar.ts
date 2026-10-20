import type { JarCoin } from "./tip-token";

/** Return the coins in `loaded`, plus any in `current` numbered above all of them, oldest first. */
export function mergeJar(options: { current: JarCoin[]; loaded: JarCoin[] }) {
  const loadedTop = Math.max(0, ...options.loaded.map(({ number }) => number));
  return [
    ...options.loaded,
    ...options.current.filter(({ number }) => number > loadedTop),
  ].toSorted((a, b) => a.number - b.number);
}
