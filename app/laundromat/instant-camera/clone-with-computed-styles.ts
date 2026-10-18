const STYLE_PROPERTIES = [
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "opacity",
  "display",
  "visibility",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "letter-spacing",
  "text-anchor",
  "dominant-baseline",
  "filter",
  "mix-blend-mode",
  "transform",
  "transform-origin",
  "transform-box",
  "clip-path",
  "mask",
  "stop-color",
  "stop-opacity",
  "paint-order",
  "flood-color",
  "flood-opacity",
  "lighting-color",
  "color",
  "vector-effect",
  "isolation",
] as const;

const SKIPPED_VALUES: { [property: string]: string } = {
  transform: "none",
  filter: "none",
  "clip-path": "none",
  mask: "none",
  "mix-blend-mode": "normal",
  isolation: "auto",
};

function getScreenScale(element: Element) {
  if (!(element instanceof SVGGraphicsElement)) return undefined;
  const matrix = element.getScreenCTM();
  if (matrix === null) return undefined;
  return Math.sqrt(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c));
}

function toStyle(options: { style: CSSStyleDeclaration; element: Element }) {
  const { style } = options;
  const hasTransform = style.getPropertyValue("transform") !== "none";
  const nonScalingStrokeScale =
    style.getPropertyValue("vector-effect") === "non-scaling-stroke"
      ? getScreenScale(options.element)
      : undefined;
  return STYLE_PROPERTIES.flatMap((property) => {
    if (nonScalingStrokeScale !== undefined && nonScalingStrokeScale > 0) {
      if (property === "vector-effect") return [];
      if (property === "stroke-width") {
        const widthPx = Number.parseFloat(style.getPropertyValue(property));
        return [`stroke-width:${widthPx / nonScalingStrokeScale}`];
      }
    }
    const value = style.getPropertyValue(property);
    if (value === "" || SKIPPED_VALUES[property] === value) return [];
    if (
      !hasTransform &&
      (property === "transform-origin" || property === "transform-box")
    ) {
      return [];
    }
    return [`${property}:${value}`];
  }).join(";");
}

/** Return a detached copy of `svg` whose every element carries its current computed paint, text, transform and filter styles inline and no classes, with non-scaling strokes turned into strokes of the same on-screen width in drawing units, so it draws the same frame without the page's stylesheets; each `<foreignObject>` holding one `<img>` becomes an `<image>`, any other is dropped. */
export function cloneWithComputedStyles(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true);
  if (!(clone instanceof SVGSVGElement)) {
    throw new Error("cloning an <svg> did not return an <svg>");
  }
  const sources = [svg, ...svg.querySelectorAll("*")];
  const copies = [clone, ...clone.querySelectorAll("*")];
  sources.forEach((source, index) => {
    const copy = copies[index];
    if (copy === undefined) return;
    copy.removeAttribute("class");
    copy.setAttribute(
      "style",
      toStyle({ style: getComputedStyle(source), element: source })
    );
  });
  for (const foreign of clone.querySelectorAll("foreignObject")) {
    const img = foreign.querySelector("img");
    if (img === null) {
      foreign.remove();
      continue;
    }
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    for (const name of ["x", "y", "width", "height"]) {
      const value = foreign.getAttribute(name);
      if (value !== null) image.setAttribute(name, value);
    }
    image.setAttribute("href", img.currentSrc || img.src);
    image.setAttribute("preserveAspectRatio", "xMidYMid slice");
    foreign.replaceWith(image);
  }
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return clone;
}
