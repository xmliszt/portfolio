export type DeleteAccountResponse =
  | { kind: "deleted" }
  | { kind: "signInRequired" }
  | { kind: "failed" };
