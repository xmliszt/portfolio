export type TipToken = {
  number: number;
  code: string;
  createdAt: string;
  uses: number;
  usesLeft: number;
  spentAt?: string;
};

export type StoredTipToken = Omit<TipToken, "uses" | "usesLeft"> &
  Partial<Pick<TipToken, "uses" | "usesLeft">>;

export type JarCoin = { number: number; createdAt: string };

export type PendingTip = { sessionId: string; code: string; cents: number };

export type CoinMachinePhase =
  | { kind: "idle" }
  | { kind: "inserting" }
  | { kind: "dispensing" }
  | { kind: "token-in-tray" };

export type SpendResult =
  | { kind: "spent"; spentAt: string; usesLeft: number }
  | { kind: "already-spent"; spentAt: string }
  | { kind: "unknown" }
  | { kind: "unavailable" };

export type TokenNotice =
  | { kind: "checking" }
  | { kind: "used"; spentAt: string }
  | { kind: "left"; usesLeft: number }
  | { kind: "unknown" }
  | { kind: "offline" };

export type GoldenChargeView = "none" | "invited" | "charged" | "charmed";

export type GoldenSpend = {
  attempt: string;
  machineId: string;
  remainingMs: number;
};

export type ChargeCheck =
  | { kind: "checking" }
  | { kind: "spent"; machineId: string; endsAtMs: number }
  | { kind: "not-spent" };

export type OwnGoldenCharge = {
  machineId: string;
  attempt: string;
  startedAt: number;
  ranAt?: number;
};
