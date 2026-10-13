import type { MachineKind } from "@/lib/laundromat/scene-config";
import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

export type RemoteLoad =
  | { phase: "loaded"; kind: MachineKind; machineId?: string }
  | {
      phase: "running";
      kind: MachineKind;
      machineId?: string;
      startedAt: number;
      durationMs: number;
    }
  | { phase: "done"; kind: MachineKind; machineId?: string };

export type RemoteFlask = {
  portions: number;
  brewStartedAt?: number;
  hotUntil?: number;
  brewedBy?: string;
  changedAt: number;
};

export type RoomRegion = { latDeg: number; lonDeg: number };

export type RoomPresence = {
  sessionId: string;
  visitorId: string;
  region?: RoomRegion;
  load?: RemoteLoad;
  coffeeGroupId?: string;
  flask?: RemoteFlask;
  writingSince?: number;
};

export type RemoteClock = {
  sessionId: string;
  visitorId: string;
  sentAt: number;
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
