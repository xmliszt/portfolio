import { createContext } from "react";

import type { GoldenWash } from "@/lib/laundromat/realtime/room-presence";
import type {
  CoinMachinePhase,
  JarCoin,
  TipToken,
} from "@/lib/laundromat/tip/tip-token";

import type { TipService } from "./tip-service";

export type TipState = {
  service: TipService;
  tokens: TipToken[];
  jar: JarCoin[] | undefined;
  machine: CoinMachinePhase;
  completeTip: (options: { sessionId: string }) => Promise<TipToken>;
  keepToken: (token: TipToken) => void;
  takeToken: () => void;
  heldTokenCode: string | undefined;
  holdToken: (code: string | undefined) => void;
  dropToken: (options: { machineId: string }) => void;
  goldenWashes: GoldenWash[];
};

export const TipContext = createContext<TipState | undefined>(undefined);
