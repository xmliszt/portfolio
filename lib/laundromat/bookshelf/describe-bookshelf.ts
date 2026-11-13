import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

/** Return the bookshelf's `label`, `tooltip` and `ready`, which is `true` only when `state` is `online`, with or without books. */
export function describeBookshelf(options: {
  state: "loading" | "offline" | "online";
  bookCount: number;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.bookshelf;
  switch (options.state) {
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
      return {
        label: copy.readyLabel,
        tooltip:
          options.bookCount === 0 ? copy.emptyTooltip : copy.readyTooltip,
        ready: true,
      };
    default: {
      const unhandled: never = options.state;
      return unhandled;
    }
  }
}
