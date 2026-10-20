export type TipToken = {
  number: number;
  code: string;
  createdAt: string;
};

export type GoldenWashView = "none" | "invited" | "running";

export type JarCoin = { number: number; createdAt: string };

export type CoinMachinePhase =
  | { kind: "idle" }
  | { kind: "inserting" }
  | { kind: "dispensing" }
  | { kind: "token-in-tray" };
