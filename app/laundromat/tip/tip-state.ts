import { createContext } from "react";

import type { GoldenWash } from "@/lib/laundromat/realtime/room-presence";
import type {
  CoinMachinePhase,
  JarCoin,
  PendingTip,
  TipToken,
  TokenNotice,
} from "@/lib/laundromat/tip/tip-token";

import type { StartTipResult } from "./tip-actions";

export type TokenRestoreResult =
  | { kind: "restored"; token: TipToken }
  | { kind: "unknown" }
  | { kind: "unavailable" };

export type TipState = {
  tokens: TipToken[];
  jar: JarCoin[] | undefined;
  machine: CoinMachinePhase;
  startTip: (options: { cents: number }) => Promise<StartTipResult>;
  rememberTip: (options: { sessionId: string }) => void;
  findPendingTip: (sessionId: string) => PendingTip | undefined;
  settleTip: (options: { sessionId: string }) => Promise<TipToken | undefined>;
  restoreToken: (options: { code: string }) => Promise<TokenRestoreResult>;
  takeToken: () => void;
  heldTokenCode: string | undefined;
  holdToken: (code: string | undefined) => void;
  dropToken: (options: { machineId: string }) => Promise<void>;
  goldenWashes: GoldenWash[];
  endGoldenWash: (machineId: string) => void;
  tokenNotice: TokenNotice | undefined;
};

export const TipContext = createContext<TipState | undefined>(undefined);
