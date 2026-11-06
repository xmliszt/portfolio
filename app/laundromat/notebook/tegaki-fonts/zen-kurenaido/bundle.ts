import glyphData from "./glyphData.json";
import glyphDataById from "./glyphDataById.json";

const fontUrl = new URL("./zen-kurenaido-d192e144.ttf", import.meta.url).href;

const bundle = {
  version: 1,
  family: "Zen Kurenaido Tegaki d192e144",
  lineCap: "round",
  fontUrl,
  fontFaceCSS: `@font-face { font-family: 'Zen Kurenaido Tegaki d192e144'; src: url(${fontUrl}); }`,
  unitsPerEm: 1000,
  ascender: 1160,
  descender: -288,
  glyphData,
  glyphDataById,
  features: ["frac", "vert", "vrt2"],
} as const;

export default bundle;
