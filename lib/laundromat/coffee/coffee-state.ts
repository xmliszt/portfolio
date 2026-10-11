export type CoffeeCup = { kind: "empty" } | { kind: "full"; hotUntil: number };

export type CoffeeState = {
  portions: number;
  brewStartedAt: number | undefined;
  hotUntil: number | undefined;
  cup: CoffeeCup;
};

export type CoffeeEvent =
  | { type: "brew" }
  | { type: "pour" }
  | { type: "drink" };

export type CoffeeTiming = {
  flaskPortions: number;
  brewMs: number;
  hotMs: number;
};

export const INITIAL_COFFEE_STATE: CoffeeState = {
  portions: 0,
  brewStartedAt: undefined,
  hotUntil: undefined,
  cup: { kind: "empty" },
};
