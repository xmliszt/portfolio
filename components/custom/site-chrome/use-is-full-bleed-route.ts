import { useSelectedLayoutSegment } from "next/navigation";

const FULL_BLEED_SEGMENTS = ["laundromat", "paws"];

/** Return `true` if the layout rendering the caller shows a segment that draws its own full-screen page; `false` for every other segment. */
export function useIsFullBleedRoute() {
  const segment = useSelectedLayoutSegment();
  return segment !== null && FULL_BLEED_SEGMENTS.includes(segment);
}
