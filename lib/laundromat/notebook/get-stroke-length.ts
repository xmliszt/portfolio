/** Return the length in pixels of the polyline through `points`. */
export function getStrokeLength(points: [number, number][]) {
  return points.reduce((total, [x, y], index) => {
    const previous = points.at(index - 1);
    return index === 0 || previous === undefined
      ? total
      : total + Math.hypot(x - previous[0], y - previous[1]);
  }, 0);
}
