import type { MachineKind } from "@/lib/laundromat/scene-config";
import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

export type RemoteLoad = {
  kind: MachineKind;
  startedAt: number;
  durationMs: number;
};

export type RoomRegion = { latDeg: number; lonDeg: number };

export type RoomPresence = {
  sessionId: string;
  visitorId: string;
  region?: RoomRegion;
  load?: RemoteLoad;
  writingSince?: number;
};

export type RemoteDraft = {
  sessionId: string;
  text: string;
  script: NotebookScript;
};
