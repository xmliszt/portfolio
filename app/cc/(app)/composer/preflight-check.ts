export type PreflightCheck =
  | {
      kind: "computed";
      id: string;
      label: string;
      why: string;
      passed: boolean;
    }
  | { kind: "manual"; id: string; label: string; why: string };
