/** Return the TrueType file of Google Fonts `family` cut down to the glyphs of `text`. */
export async function loadGoogleFont(options: {
  family: string;
  text: string;
}) {
  const query = new URLSearchParams({
    family: options.family,
    text: options.text,
  });
  const response = await fetch(`https://fonts.googleapis.com/css2?${query}`);
  if (!response.ok) {
    throw new Error(
      `Google Fonts returned ${response.status} for ${options.family}`
    );
  }
  const css = await response.text();
  const url = css.match(
    /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/
  )?.[1];
  if (url === undefined)
    throw new Error(`Google Fonts sent no font file for ${options.family}`);
  const font = await fetch(url);
  if (!font.ok)
    throw new Error(
      `Google Fonts returned ${font.status} for ${options.family}`
    );
  return font.arrayBuffer();
}
