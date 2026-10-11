import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

export type ShelfState =
  | { kind: "loading" }
  | { kind: "offline" }
  | { kind: "online"; bookCount: number };

/** Return the shelf's `label` and `tooltip` for `shelf`, and `ready` when it holds at least one filled notebook to look at. */
export function describeShelf(options: {
  shelf: ShelfState;
  copy: LaundromatCopy;
}) {
  const { shelf } = options;
  const copy = options.copy.shelf;
  switch (shelf.kind) {
    case "loading":
      return {
        label: copy.loadingLabel,
        tooltip: copy.loadingTooltip,
        ready: false,
      };
    case "offline":
      return {
        label: copy.offlineLabel,
        tooltip: copy.offlineTooltip,
        ready: false,
      };
    case "online":
      if (shelf.bookCount === 0) {
        return {
          label: copy.emptyLabel,
          tooltip: copy.emptyTooltip,
          ready: false,
        };
      }
      return {
        label: copy.readyLabel,
        tooltip: copy.bookCount({ count: shelf.bookCount }),
        ready: true,
      };
    default: {
      const unhandled: never = shelf;
      return unhandled;
    }
  }
}
