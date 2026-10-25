import type { ToyBoxState, ToyBoxView } from "./toy-box-view";

export function resumeToyBox(options: {
  state: ToyBoxState;
  nowMs: number;
}): ToyBoxState {
  const { state, nowMs } = options;
  if (state.suspendedAtMs === undefined) return state;
  const elapsedMs = Math.max(0, nowMs - state.suspendedAtMs);
  const { view } = state;
  const resumedView: ToyBoxView = (() => {
    switch (view.kind) {
      case "departing":
        return {
          ...view,
          startedAtMs: view.startedAtMs + elapsedMs,
          contents:
            view.contents.kind === "closed"
              ? view.contents
              : view.contents.kind === "open"
                ? {
                    ...view.contents,
                    runStartedAtMs: view.contents.runStartedAtMs + elapsedMs,
                  }
                : {
                    ...view.contents,
                    startedAtMs: view.contents.startedAtMs + elapsedMs,
                  },
        };
      case "arriving":
      case "open":
      case "opening":
      case "closed":
      case "hidden":
        return view;
      default: {
        const unhandled: never = view;
        return unhandled;
      }
    }
  })();
  return {
    ...state,
    suspendedAtMs: undefined,
    view: resumedView,
  };
}
