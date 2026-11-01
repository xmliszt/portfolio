const EDGE_ALPHA = 0.2;

/** Darken the corners of `canvas` with a soft ink-blue vignette, leaving the middle as it is. */
export function paintPhotoVignette(canvas: HTMLCanvasElement) {
  const { width, height } = canvas;
  const g = canvas.getContext("2d");
  if (g === null) return;
  const vignette = g.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.4,
    width / 2,
    height / 2,
    Math.hypot(width, height) * 0.58
  );
  vignette.addColorStop(0, "rgba(43, 58, 99, 0)");
  vignette.addColorStop(1, `rgba(43, 58, 99, ${EDGE_ALPHA})`);
  g.globalCompositeOperation = "multiply";
  g.fillStyle = vignette;
  g.fillRect(0, 0, width, height);
  g.globalCompositeOperation = "source-over";
}
