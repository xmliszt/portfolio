import { getToyBoxWindow } from "./get-toy-box-window";
import type { ToyBoxState } from "./toy-box-view";
import { TOY_DELIVERY_TIMING } from "./toy-delivery-timing";

export function advanceToyBox(options: {
  state: ToyBoxState;
  now: Date;
  nowMs: number;
  openingMs: number;
  reducedMotion: boolean;
  visible: boolean;
}): ToyBoxState {
  const { state, nowMs } = options;
  const window = getToyBoxWindow(options.now);
  const { view } = state;
  if (window.active) {
    if (state.windowStartedAtMs !== window.startMs || view.kind === "hidden") {
      return {
        windowStartedAtMs: window.startMs,
        openingStartedAtMs: undefined,
        view: { kind: "arriving", startedAtMs: nowMs },
      };
    }
    switch (view.kind) {
      case "arriving":
        return nowMs - view.startedAtMs >=
          (options.reducedMotion
            ? TOY_DELIVERY_TIMING.reducedArrivalMs
            : TOY_DELIVERY_TIMING.arrivalMs)
          ? { ...state, view: { kind: "closed" } }
          : state;
      case "opening":
        return state.openingStartedAtMs !== undefined &&
          nowMs - state.openingStartedAtMs >= options.openingMs
          ? { ...state, view: { kind: "open", runStartedAtMs: -Infinity } }
          : state;
      case "departing":
        return { ...state, view: { kind: "arriving", startedAtMs: nowMs } };
      case "closed":
      case "open":
        return state;
      default: {
        const unhandled: never = view;
        return unhandled;
      }
    }
  }
  if (view.kind === "hidden") return state;
  if (
    !options.visible ||
    options.now.getTime() >=
      window.endMs +
        (options.reducedMotion
          ? TOY_DELIVERY_TIMING.reducedDepartureMs
          : TOY_DELIVERY_TIMING.departureMs) ||
    state.windowStartedAtMs !== window.startMs ||
    options.now.getTime() < window.startMs ||
    view.kind === "arriving"
  ) {
    return {
      ...state,
      openingStartedAtMs: undefined,
      view: { kind: "hidden" },
    };
  }
  if (view.kind === "departing") {
    return nowMs - view.startedAtMs >=
      (options.reducedMotion
        ? TOY_DELIVERY_TIMING.reducedDepartureMs
        : TOY_DELIVERY_TIMING.departureMs)
      ? { ...state, openingStartedAtMs: undefined, view: { kind: "hidden" } }
      : state;
  }
  return {
    ...state,
    openingStartedAtMs: undefined,
    view: {
      kind: "departing",
      startedAtMs: nowMs - (options.now.getTime() - window.endMs),
      contents: (() => {
        switch (view.kind) {
          case "closed":
            return { kind: "closed" };
          case "opening":
            return {
              kind: "opening",
              startedAtMs: state.openingStartedAtMs ?? nowMs,
            };
          case "open":
            return { kind: "open", runStartedAtMs: view.runStartedAtMs };
          default: {
            const unhandled: never = view;
            return unhandled;
          }
        }
      })(),
    },
  };
}
