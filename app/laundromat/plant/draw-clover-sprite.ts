export type CloverGreens = {
  leaf: string;
  shadow: string;
  vein: string;
  edge: string;
};

const LEAF_ANGLES_DEG = [-8, 82, 172, 262];

function traceLeaf(context: CanvasRenderingContext2D, lengthPx: number) {
  const l = lengthPx;
  context.beginPath();
  context.moveTo(0, 0);
  context.bezierCurveTo(
    -0.45 * l,
    -0.12 * l,
    -0.72 * l,
    -0.55 * l,
    -0.52 * l,
    -0.86 * l
  );
  context.bezierCurveTo(
    -0.36 * l,
    -1.08 * l,
    -0.08 * l,
    -1.04 * l,
    0,
    -0.82 * l
  );
  context.bezierCurveTo(
    0.08 * l,
    -1.04 * l,
    0.36 * l,
    -1.08 * l,
    0.52 * l,
    -0.86 * l
  );
  context.bezierCurveTo(0.72 * l, -0.55 * l, 0.45 * l, -0.12 * l, 0, 0);
  context.closePath();
}

/** Return a square canvas of `sizePx` with a four-leaf clover and stem painted in `greens`, centred on the leaves' meeting point. */
export function drawCloverSprite(options: {
  sizePx: number;
  greens: CloverGreens;
}) {
  const { sizePx, greens } = options;
  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const context = canvas.getContext("2d");
  if (context === null) return canvas;
  const center = sizePx / 2;
  const leafPx = sizePx * 0.27;

  context.strokeStyle = greens.edge;
  context.lineCap = "round";
  context.lineWidth = sizePx * 0.035;
  context.beginPath();
  context.moveTo(center, center);
  context.quadraticCurveTo(
    center + sizePx * 0.12,
    center + sizePx * 0.22,
    center + sizePx * 0.32,
    center + sizePx * 0.3
  );
  context.stroke();

  LEAF_ANGLES_DEG.forEach((angleDeg) => {
    context.save();
    context.translate(center, center);
    context.rotate((angleDeg * Math.PI) / 180);
    traceLeaf(context, leafPx);
    context.fillStyle = greens.leaf;
    context.fill();
    context.save();
    context.clip();
    context.fillStyle = greens.shadow;
    context.fillRect(0, -leafPx * 1.2, leafPx, leafPx * 1.3);
    const shine = context.createRadialGradient(
      -leafPx * 0.4,
      -leafPx * 0.75,
      0,
      -leafPx * 0.4,
      -leafPx * 0.75,
      leafPx * 0.45
    );
    shine.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    shine.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = shine;
    context.fillRect(-leafPx, -leafPx * 1.2, leafPx, leafPx * 1.3);
    context.restore();
    context.strokeStyle = greens.vein;
    context.lineWidth = leafPx * 0.05;
    context.beginPath();
    context.moveTo(0, -leafPx * 0.08);
    context.lineTo(0, -leafPx * 0.78);
    context.stroke();
    traceLeaf(context, leafPx);
    context.strokeStyle = greens.edge;
    context.lineWidth = Math.max(1, leafPx * 0.03);
    context.stroke();
    context.restore();
  });
  return canvas;
}
