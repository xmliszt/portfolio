export type ToyBoxView =
  | { kind: "hidden" }
  | { kind: "arriving"; startedAtMs: number }
  | { kind: "closed" }
  | { kind: "opening" }
  | { kind: "open"; runStartedAtMs: number }
  | {
      kind: "departing";
      startedAtMs: number;
      contents:
        | { kind: "closed" }
        | { kind: "opening"; startedAtMs: number }
        | { kind: "open"; runStartedAtMs: number };
    };

export type ToyBoxState = {
  suspendedAtMs?: number;
  windowStartedAtMs: number | undefined;
  openingStartedAtMs: number | undefined;
  view: ToyBoxView;
};
