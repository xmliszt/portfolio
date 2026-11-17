/** Return four CSS colors for `color` lit from the front: lit, base, side and deep shade. */
export function getColorShades(color: string) {
  return [
    `color-mix(in srgb, ${color} 78%, #fff3d6)`,
    color,
    `color-mix(in srgb, ${color} 78%, #10141c)`,
    `color-mix(in srgb, ${color} 58%, #10141c)`,
  ] as const;
}
