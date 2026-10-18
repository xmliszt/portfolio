import { getNoteFontScale } from "@/lib/laundromat/instant-camera/get-note-font-scale";
import { getPolaroidMetrics } from "@/lib/laundromat/instant-camera/get-polaroid-metrics";
import { INSTANT_CAMERA } from "@/lib/laundromat/instant-camera/instant-camera-config";
import type { ViewfinderOrientation } from "@/lib/laundromat/instant-camera/viewfinder-frame";
import { wrapNoteLines } from "@/lib/laundromat/instant-camera/wrap-note-lines";

const PRINT_LONG_PX = 1350;
const MIN_NOTE_PX = 20;

/** Return the whole polaroid as a PNG: `photoUrl` inside the paper border, `note` in `noteFont` on at most two lines, shrinking the note until it fits, and the `stamp` text in `stampFont` along the bottom. */
export async function renderPolaroidBlob(options: {
  photoUrl: string;
  orientation: ViewfinderOrientation;
  note: string;
  noteFont: string;
  stampFont: string;
  stamp: { left: string; right: string };
  colors: { paper: string; ink: string; stamp: string };
}) {
  const note = options.note.trim();
  const metrics = getPolaroidMetrics({
    orientation: options.orientation,
    longPx: PRINT_LONG_PX,
  });
  const startNotePx = Math.round(metrics.notePx * getNoteFontScale(note));
  await Promise.all([
    document.fonts.load(`${startNotePx}px ${options.noteFont}`, note || "a"),
    document.fonts.load(`${metrics.stampPx}px ${options.stampFont}`),
  ]).catch(() => []);
  const photo = new Image();
  photo.src = options.photoUrl;
  await photo.decode();

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(metrics.cardWidth);
  canvas.height = Math.round(metrics.cardHeight);
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("no 2d canvas context");
  context.fillStyle = options.colors.paper;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    photo,
    metrics.border,
    metrics.border,
    metrics.photoWidth,
    metrics.photoHeight
  );

  const noteWidth = metrics.photoWidth - 4;
  const fit = (() => {
    for (let px = startNotePx; px > MIN_NOTE_PX; px -= 2) {
      context.font = `${px}px ${options.noteFont}`;
      const lines = wrapNoteLines({
        text: note,
        maxWidth: noteWidth,
        measure: (text) => context.measureText(text).width,
      });
      if (lines.length <= INSTANT_CAMERA.noteMaxLines) return { px, lines };
    }
    context.font = `${MIN_NOTE_PX}px ${options.noteFont}`;
    return {
      px: MIN_NOTE_PX,
      lines: wrapNoteLines({
        text: note,
        maxWidth: noteWidth,
        measure: (text) => context.measureText(text).width,
      }).slice(0, INSTANT_CAMERA.noteMaxLines),
    };
  })();
  context.fillStyle = options.colors.ink;
  context.textBaseline = "top";
  context.font = `${fit.px}px ${options.noteFont}`;
  const noteTop = metrics.border + metrics.photoHeight + metrics.noteTop;
  fit.lines.forEach((line, index) =>
    context.fillText(line, metrics.border + 2, noteTop + index * fit.px * 1.05)
  );

  context.font = `${metrics.stampPx}px ${options.stampFont}`;
  context.fillStyle = options.colors.stamp;
  context.textBaseline = "alphabetic";
  const stampY = canvas.height - metrics.stampBottom;
  context.textAlign = "left";
  context.fillText(options.stamp.left, metrics.border + 2, stampY);
  context.textAlign = "right";
  context.fillText(
    options.stamp.right,
    canvas.width - metrics.border - 2,
    stampY
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (blob === null) throw new Error("the polaroid could not be encoded");
  return blob;
}
