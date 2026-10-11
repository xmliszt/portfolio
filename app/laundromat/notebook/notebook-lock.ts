import type { RemoteDraft } from "@/lib/laundromat/realtime/room-presence";

export type NotebookLock =
  | { kind: "free" }
  | {
      kind: "taken";
      writerSessionId: string;
      draft: RemoteDraft | undefined;
    };
