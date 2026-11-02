export type XApiResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "error"; status: number; message: string };
