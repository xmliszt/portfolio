import type { LaundryLoad } from "./laundry-state";

export type Homecoming =
  | { kind: "fresh" }
  | { kind: "away" }
  | { kind: "carrying"; laundry: "dirty" | "wet" };

/** Return what the bedroom looks like when the visitor heads home with their laundry in `load`: `fresh` (a new dirty load on the floor) when dry laundry is in the basket, `carrying` the basket when it holds dirty or wet laundry, and `away` while the laundry is still in a machine, finished or not. */
export function getHomecoming(options: { load: LaundryLoad }): Homecoming {
  const { load } = options;
  switch (load.kind) {
    case "folded":
      return { kind: "fresh" };
    case "carrying":
      return { kind: "carrying", laundry: load.laundry };
    case "loaded":
    case "running":
    case "done":
      return { kind: "away" };
    default: {
      const unhandled: never = load;
      return unhandled;
    }
  }
}
