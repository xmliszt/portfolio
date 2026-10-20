import type { JarCoin, TipToken } from "@/lib/laundromat/tip/tip-token";

export type RestoreResult =
  | { kind: "restored"; token: TipToken }
  | { kind: "unknown" };

export type TipService = {
  startTip: (options: { cents: number }) => Promise<{ sessionId: string }>;
  payTip: (options: { sessionId: string }) => Promise<{ kind: "paid" }>;
  claimTip: (options: { sessionId: string }) => Promise<TipToken>;
  restoreToken: (options: { code: string }) => Promise<RestoreResult>;
  loadJar: () => Promise<JarCoin[]>;
};
