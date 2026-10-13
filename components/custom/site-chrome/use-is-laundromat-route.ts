import { useSelectedLayoutSegment } from "next/navigation";

/** Return `true` if the layout rendering the caller shows the `laundromat` segment; `false` when it shows any other segment. */
export function useIsLaundromatRoute() {
  return useSelectedLayoutSegment() === "laundromat";
}
