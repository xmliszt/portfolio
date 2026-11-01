export type ThreadsApiErrorReason =
  | "token"
  | "permission"
  | "rate-limit"
  | "other";

export type ThreadsApiResult<T> =
  | { kind: "ok"; data: T }
  | {
      kind: "error";
      reason: ThreadsApiErrorReason;
      status: number;
      message: string;
    };
