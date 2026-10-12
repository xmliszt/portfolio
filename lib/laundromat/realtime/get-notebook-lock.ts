import type { NotebookLock } from "./notebook-lock";
import type { RemoteDraft } from "./room-presence";

/** Return the notebook lock for this tab: `taken` when `writerSessionId` is another tab and the room is not `isDown`, otherwise `joining` while this tab is not writing and is still making its first connection, or is connected but not `isSynced` or not `isUrgentReady`, and `free` in every other case, including a lost connection. */
export function getNotebookLock(options: {
  writerSessionId: string | undefined;
  ownSessionId: string;
  isOwnWriting: boolean;
  room: {
    isConnecting: boolean;
    isConnected: boolean;
    isSynced: boolean;
    isUrgentReady: boolean;
    isDown: boolean;
    drafts: { [sessionId: string]: RemoteDraft };
  };
}): NotebookLock {
  const { writerSessionId, room } = options;
  if (
    writerSessionId !== undefined &&
    writerSessionId !== options.ownSessionId &&
    !room.isDown
  ) {
    return {
      kind: "taken",
      writerSessionId,
      draft: room.drafts[writerSessionId],
    };
  }
  const canClaimNow = room.isSynced && room.isUrgentReady;
  const isJoining =
    !options.isOwnWriting &&
    (room.isConnecting || (room.isConnected && !canClaimNow));
  return isJoining ? { kind: "joining" } : { kind: "free" };
}
