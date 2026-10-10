import type { LaundryLoad } from "./laundry-state";

export type BasketContents = "empty" | "dirty" | "wet" | "folded";

/** Return what the visitor's basket holds while their laundry is in `load`. */
export function getBasketContents(load: LaundryLoad): BasketContents {
  switch (load.kind) {
    case "carrying":
      return load.laundry;
    case "folded":
      return "folded";
    case "loaded":
    case "running":
    case "done":
      return "empty";
    default: {
      const unhandled: never = load;
      return unhandled;
    }
  }
}
