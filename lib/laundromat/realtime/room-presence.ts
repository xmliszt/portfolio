import type { DoodleDrawing } from "@/lib/laundromat/notebook/doodle-stroke";
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

export type GoldenCharge = {
  machineId: string;
  attempt: string;
  startedAt: number;
};

export type RoomPresence = {
  sessionId: string;
  visitorId: string;
  region?: RoomRegion;
  load?: RemoteLoad;
  coffeeGroupId?: string;
  flask?: RemoteFlask;
  writingSince?: number;
  goldenCharges?: GoldenCharge[];
};

export type RemoteClock = {
  sessionId: string;
  visitorId: string;
  sentAt: number;
};

export type DraftSelection = { start: number; end: number };

export type DraftContent =
  | {
      kind: "text";
      text: string;
      script: NotebookScript;
      selection?: DraftSelection;
    }
  | { kind: "doodle"; drawing: DoodleDrawing | undefined };

export type RemoteDraft = { sessionId: string } & DraftContent;

export type RemoteEntry = {
  sessionId: string;
  notebookNumber: number;
  entry: {
    id: number;
    page: number;
    lineStart: number;
    lineCount: number;
    signOff: string | null;
    script: NotebookScript;
    createdAt: string;
  } & (
    | { kind: "text"; body: string }
    | { kind: "doodle"; drawing: DoodleDrawing | undefined }
  );
};
