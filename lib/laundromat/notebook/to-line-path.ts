/** Return an SVG path of straight segments through `points`. */
export function toLinePath(points: [number, number][]) {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");
}
