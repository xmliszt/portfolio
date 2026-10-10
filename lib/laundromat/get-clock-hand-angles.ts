/** Return the clockwise angles in degrees from 12 o'clock of the hour and minute hands at fractional `hour`. */
export function getClockHandAngles(hour: number) {
  const minutes = (((hour % 24) + 24) % 24) * 60;
  return {
    hourDeg: ((minutes / 60) % 12) * 30,
    minuteDeg: (minutes % 60) * 6,
  };
}
