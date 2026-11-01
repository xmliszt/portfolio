/** World units per centimetre, from a medium cat's 45 cm body. */
const UNITS_PER_CM = 2.6;
const cm = (value: number) => value * UNITS_PER_CM;

/** How the room's toys measure and move, in world units: each toy's radius (half the side for the box, the full ball for the yarn), the roll's length and core, the bowl's base and depth, the box's bottom and walls, how fast toys stop sliding (per second), how much thread a yarn ball and paper a roll hold, how long spilled water stays before the bowl is full again, and how long a used-up toy and its trail take to fade. */
export const TOY_LIMITS = {
  radius: { yarn: cm(6.5), roll: cm(5.5), bowl: cm(11), box: cm(20) },
  roll: { halfLength: cm(5), core: cm(2.2) },
  bowl: { baseRadius: cm(7), depth: cm(6) },
  box: { halfWidth: cm(20), halfDepth: cm(15), height: cm(25) },
  stripWidth: cm(10),
  puddleRadius: cm(24),
  friction: { yarn: 1.1, roll: 2.2, bowl: 5, box: 20 },
  maxUnrolled: 1500,
  threadLength: 2000,
  spillSeconds: 210,
  fadeSeconds: 90,
} as const;
