const CLOUD_SHAPES = {
  tall: [
    { x: -3, y: -7.5, r: 6 },
    { x: 4.5, y: -6, r: 5 },
    { x: -9.5, y: -3.6, r: 4 },
    { x: 10.5, y: -3.2, r: 3.8 },
    { x: -2, y: -3, r: 5.2 },
    { x: 5.5, y: -2.4, r: 4.4 },
    { x: -13, y: -1.6, r: 2.6 },
    { x: 14, y: -1.4, r: 2.4 },
  ],
  long: [
    { x: -6, y: -4.6, r: 4.4 },
    { x: 2, y: -5.2, r: 4.8 },
    { x: 9, y: -3.8, r: 3.6 },
    { x: -12, y: -2.4, r: 3 },
    { x: -2, y: -2.2, r: 4 },
    { x: 6, y: -1.8, r: 3.4 },
    { x: 14.5, y: -1.6, r: 2.4 },
  ],
};
const CLOUDS = [
  {
    cell: 0,
    layer: "far",
    shape: "tall",
    mirrored: false,
    across: 0.95,
    up: 1,
    size: 0.6,
  },
  {
    cell: 1,
    layer: "far",
    shape: "long",
    mirrored: true,
    across: 0,
    up: 1,
    size: 0.65,
  },
  {
    cell: 0,
    layer: "near",
    shape: "long",
    mirrored: false,
    across: 0.2,
    up: 0,
    size: 0.85,
  },
  {
    cell: 1,
    layer: "near",
    shape: "tall",
    mirrored: true,
    across: 0.9,
    up: 0,
    size: 1,
  },
] as const;
const FAIR_COVER = 0.6;
const STORM_COVER = 0.95;

export type GlassCell = { x: number; y: number; width: number; height: number };

/** Return the clouds for the two glass `cells` of a window under `cover`, each with its `layer`, `shapeKey`, `puffs` (mirrored when the cloud is) with their `bounds` around a flat base at (`x`, `y`) and `scale`, sized and placed to stay `marginPx` inside its cell, and the `storminess` (0 at fair cover, 1 at storm cover). */
export function getWindowClouds(options: {
  cover: number;
  cells: [GlassCell, GlassCell];
  marginPx: number;
}) {
  const { cover, cells, marginPx } = options;
  const storminess = Math.min(
    1,
    Math.max(0, (cover - FAIR_COVER) / (STORM_COVER - FAIR_COVER))
  );
  const clouds = CLOUDS.map((cloud) => {
    const cell = cells[cloud.cell];
    const puffs = CLOUD_SHAPES[cloud.shape].map((puff) => ({
      ...puff,
      x: cloud.mirrored ? -puff.x : puff.x,
    }));
    const left = Math.min(...puffs.map((puff) => puff.x - puff.r));
    const right = Math.max(...puffs.map((puff) => puff.x + puff.r));
    const top = Math.min(...puffs.map((puff) => puff.y - puff.r));
    const room = {
      width: cell.width - 2 * marginPx,
      height: cell.height - 2 * marginPx,
    };
    const scale =
      cloud.size *
      Math.max(0, Math.min(room.width / (right - left), room.height / -top));
    const slack = {
      x: room.width - (right - left) * scale,
      y: room.height + top * scale,
    };
    return {
      layer: cloud.layer,
      shapeKey: `${cloud.shape}${cloud.mirrored ? "-mirrored" : ""}`,
      puffs,
      bounds: { left, right, top },
      x: cell.x + marginPx - left * scale + cloud.across * slack.x,
      y: cell.y + marginPx - top * scale + (1 - cloud.up) * slack.y,
      scale,
    };
  });
  return { storminess, clouds };
}
