import type { Homecoming } from "@/lib/laundromat/laundry/get-homecoming";

export type BedroomBasket =
  | { kind: "hamper" }
  | { kind: "carried"; laundry: "dirty" | "wet" }
  | { kind: "none" };

/** Return how the bedroom is set for `home`: whether dirty clothes lie on the floor, whether the door opens without filling the hamper first, and which `basket` stands in the room. */
export function getBedroomMode(options: { home: Homecoming }): {
  hasFloorClothes: boolean;
  isDoorOpen: boolean;
  basket: BedroomBasket;
} {
  const { home } = options;
  switch (home.kind) {
    case "fresh":
      return {
        hasFloorClothes: true,
        isDoorOpen: false,
        basket: { kind: "hamper" },
      };
    case "carrying":
      return {
        hasFloorClothes: false,
        isDoorOpen: true,
        basket: { kind: "carried", laundry: home.laundry },
      };
    case "away":
      return {
        hasFloorClothes: false,
        isDoorOpen: true,
        basket: { kind: "none" },
      };
    default: {
      const unhandled: never = home;
      return unhandled;
    }
  }
}
