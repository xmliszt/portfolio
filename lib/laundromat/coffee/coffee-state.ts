export type CoffeeCup = { kind: "empty" } | { kind: "full"; hotUntil: number };

export type CoffeeFlask = {
  portions: number;
  brewStartedAt: number | undefined;
  hotUntil: number | undefined;
  brewedBy: string | undefined;
  changedAt: number | undefined;
};

export type CoffeeState = {
  flask: CoffeeFlask;
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
  flask: {
    portions: 0,
    brewStartedAt: undefined,
    hotUntil: undefined,
    brewedBy: undefined,
    changedAt: undefined,
  },
  cup: { kind: "empty" },
};
