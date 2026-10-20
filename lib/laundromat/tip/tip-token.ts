export type TipToken = {
  number: number;
  code: string;
  createdAt: string;
  spentAt?: string;
};

export type JarCoin = { number: number; createdAt: string };

export type PendingTip = { sessionId: string; code: string; cents: number };

export type CoinMachinePhase =
  | { kind: "idle" }
  | { kind: "inserting" }
  | { kind: "dispensing" }
  | { kind: "token-in-tray" };

export type SpendResult =
  | { kind: "spent"; spentAt: string }
  | { kind: "already-spent"; spentAt: string }
  | { kind: "unknown" }
  | { kind: "unavailable" };

export type TokenNotice =
  | { kind: "checking" }
  | { kind: "used"; spentAt: string }
  | { kind: "unknown" }
  | { kind: "offline" };

export type GoldenWashView = "none" | "invited" | "charged" | "charmed";
