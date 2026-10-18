import { parseUnicodeRange } from "@/lib/laundromat/instant-camera/parse-unicode-range";

import { fetchAsDataUrl } from "./fetch-as-data-url";

function familyNames(fontFamily: string) {
  return fontFamily
    .split(",")
    .map((name) => name.trim().replace(/^["']|["']$/g, ""));
}

function readFontFaces() {
  return [...document.styleSheets].flatMap((sheet) => {
    try {
      return [...sheet.cssRules].filter(
        (rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule
      );
    } catch {
      return [];
    }
  });
}

/** Return `@font-face` rules, with their font files inlined as `data:` URLs, for the page's faces in `fontFamilies` whose `unicode-range` covers a character of `text`; `cache` keeps each file's `data:` URL between calls. */
export async function getEmbeddedFontCss(options: {
  fontFamilies: string[];
  text: string;
  cache: { [url: string]: string | undefined };
}) {
  const wanted = new Set(options.fontFamilies.flatMap(familyNames));
  const codePoints = [...new Set(options.text)].map(
    (character) => character.codePointAt(0) ?? 0
  );
  const faces = readFontFaces().filter((face) => {
    if (
      !wanted.has(
        familyNames(face.style.getPropertyValue("font-family"))[0] ?? ""
      )
    ) {
      return false;
    }
    const range = face.style.getPropertyValue("unicode-range");
    if (range === "") return true;
    const ranges = parseUnicodeRange(range);
    return codePoints.some((point) =>
      ranges.some(({ from, to }) => point >= from && point <= to)
    );
  });
  const rules = await Promise.all(
    faces.map(async (face) => {
      const src = face.style.getPropertyValue("src");
      const url = /url\(["']?([^"')]+)["']?\)/.exec(src)?.[1];
      if (url === undefined) return "";
      const absolute = new URL(
        url,
        face.parentStyleSheet?.href ?? location.href
      ).href;
      if (!(absolute in options.cache)) {
        options.cache[absolute] = await fetchAsDataUrl(absolute);
      }
      const dataUrl = options.cache[absolute];
      if (dataUrl === undefined) return "";
      const descriptors = [
        "font-family",
        "font-style",
        "font-weight",
        "unicode-range",
      ]
        .map((name) => [name, face.style.getPropertyValue(name)] as const)
        .filter(([, value]) => value !== "")
        .map(([name, value]) => `${name}:${value};`)
        .join("");
      return `@font-face{${descriptors}src:url(${dataUrl});}`;
    })
  );
  return rules.join("");
}
