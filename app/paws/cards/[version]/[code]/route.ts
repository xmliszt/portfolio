import { createCanvas } from "@napi-rs/canvas";

import type { AnyCanvas } from "@/lib/paws/render/render-types";
import { CAT_CARD } from "@/lib/paws/share/cat-card";
import { decodeCatLook } from "@/lib/paws/share/decode-cat-look";
import { drawCatCard } from "@/lib/paws/share/draw-cat-card";

type CatCardContext = {
  params: Promise<{ version: string; code: string }>;
};

// The room renderer is typed against DOM canvases; @napi-rs/canvas implements the same 2D API on the server.
function createServerCanvas(options: { width: number; height: number }) {
  return createCanvas(options.width, options.height) as unknown as AnyCanvas;
}

export async function GET(_request: Request, context: CatCardContext) {
  const { version, code } = await context.params;
  const look = version === CAT_CARD.version ? decodeCatLook(code) : undefined;
  if (look === undefined) return new Response(null, { status: 404 });
  const canvas = createCanvas(CAT_CARD.width, CAT_CARD.height);
  drawCatCard({
    g: canvas.getContext("2d") as unknown as CanvasRenderingContext2D,
    createCanvas: createServerCanvas,
    look,
    width: CAT_CARD.width,
    height: CAT_CARD.height,
  });
  return new Response(new Uint8Array(await canvas.encode("jpeg", 90)), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
