export type ReportMeowRequest = { userId: string };

export type ReportMeowResponse =
  | { kind: "reported" }
  | { kind: "alreadyReported" }
  | { kind: "nothingToReport" }
  | { kind: "invalid" }
  | { kind: "signInRequired" };
