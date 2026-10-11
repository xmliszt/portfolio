import type { MachineKind } from "@/lib/laundromat/scene-config";
import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

export type RemoteLoad =
  | { phase: "loaded"; kind: MachineKind }
  | {
      phase: "running";
      kind: MachineKind;
      startedAt: number;
      durationMs: number;
    }
  | { phase: "done"; kind: MachineKind };

export type RoomRegion = { latDeg: number; lonDeg: number };

export type RoomPresence = {
  sessionId: string;
  visitorId: string;
  region?: RoomRegion;
  load?: RemoteLoad;
  writingSince?: number;
};

export type DraftSelection = { start: number; end: number };

export type RemoteDraft = {
  sessionId: string;
  text: string;
  script: NotebookScript;
  selection?: DraftSelection;
};

export type RemoteEntry = {
  sessionId: string;
  notebookNumber: number;
  entry: {
    id: number;
    page: number;
    lineStart: number;
    lineCount: number;
    body: string;
    signOff: string | null;
    script: NotebookScript;
    createdAt: string;
  };
};
