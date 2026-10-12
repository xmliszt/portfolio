import type { RemoteDraft } from "./room-presence";

export type NotebookLock =
  | { kind: "free" }
  | { kind: "joining" }
  | {
      kind: "taken";
      writerSessionId: string;
      draft: RemoteDraft | undefined;
    };
