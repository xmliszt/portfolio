import glyphData from "./glyphData.json";

const fontUrl = new URL("./stroke-code-fan-v325-fbeec9e6.ttf", import.meta.url)
  .href;

const bundle = {
  version: 1,
  family: "Stroke Code Fan v325 Tegaki fbeec9e6",
  lineCap: "round",
  fontUrl,
  fontFaceCSS: `@font-face { font-family: 'Stroke Code Fan v325 Tegaki fbeec9e6'; src: url(${fontUrl}); }`,
  unitsPerEm: 1000,
  ascender: 1080,
  descender: -320,
  glyphData,
} as const;

export default bundle;
