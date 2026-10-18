/** Return an SVG path through `points` that curves through the midpoints between them. */
export function toStrokePath(points: [number, number][]) {
  const first = points.at(0);
  const last = points.at(-1);
  if (first === undefined || last === undefined) return "";
  if (points.length < 3) {
    return points
      .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
      .join(" ");
  }
  const curves = points.slice(1, -1).map(([x, y], index) => {
    const [nextX, nextY] = points[index + 2];
    return `Q${x} ${y} ${(x + nextX) / 2} ${(y + nextY) / 2}`;
  });
  return `M${first[0]} ${first[1]} ${curves.join(" ")} L${last[0]} ${last[1]}`;
}
