import { mapScreenRectToSvg } from "@/lib/laundromat/instant-camera/map-screen-rect-to-svg";
import type { ViewfinderFrame } from "@/lib/laundromat/instant-camera/viewfinder-frame";

import { cloneWithComputedStyles } from "./clone-with-computed-styles";
import { embedSvgImages } from "./embed-svg-images";

import { getEmbeddedFontCss } from "./get-embedded-font-css";

/** Return a canvas `longPx` on its long edge holding the part of `svg` under the screen rectangle `frame`, drawn from the SVG itself so it stays sharp at any frame size, over `background` where the frame leaves the drawing. */
export async function captureRoomPhoto(options: {
  svg: SVGSVGElement;
  frame: ViewfinderFrame;
  longPx: number;
  background: string;
  fontCache: { [url: string]: string | undefined };
}) {
  const { svg, frame } = options;
  const box = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  const area = mapScreenRectToSvg({
    rect: frame,
    svgBox: box,
    viewBox: {
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width || box.width,
      height: viewBox.height || box.height,
    },
  });
  const scale = options.longPx / Math.max(frame.width, frame.height);
  const width = Math.round(frame.width * scale);
  const height = Math.round(frame.height * scale);

  const clone = cloneWithComputedStyles(svg);
  await embedSvgImages(clone);
  const fontFamilies = [
    ...new Set(
      [...clone.querySelectorAll("text, tspan")].map(
        (text) =>
          text.getAttribute("style")?.match(/font-family:([^;]+)/)?.[1] ?? ""
      )
    ),
  ].filter((family) => family !== "");
  const fontCss = await getEmbeddedFontCss({
    fontFamilies,
    text: clone.textContent ?? "",
    cache: options.fontCache,
  });
  clone.setAttribute(
    "viewBox",
    `${area.x} ${area.y} ${area.width} ${area.height}`
  );
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("preserveAspectRatio", "none");
  clone.style.setProperty("overflow", "hidden");
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = fontCss;
  const backdrop = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  backdrop.setAttribute("x", String(area.x));
  backdrop.setAttribute("y", String(area.y));
  backdrop.setAttribute("width", String(area.width));
  backdrop.setAttribute("height", String(area.height));
  backdrop.setAttribute("fill", options.background);
  clone.prepend(style, backdrop);

  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(clone)], {
      type: "image/svg+xml",
    })
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}
