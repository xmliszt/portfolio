import { getCaptionWidthEm } from "@/lib/laundromat/tv/get-caption-width-em";

/** Return the largest font size up to `maxFontSize` at which `text`, set in the monospace caption font, fits in `maxWidth`. */
export function fitCaptionFontSize(options: {
  text: string;
  maxWidth: number;
  maxFontSize: number;
}) {
  const widthEm = getCaptionWidthEm(options.text);
  return widthEm === 0
    ? options.maxFontSize
    : Math.min(options.maxFontSize, options.maxWidth / widthEm);
}
