import omit from "lodash/omit.js";

import { createTokenCode } from "@/lib/laundromat/tip/create-token-code";
import { isTipToken } from "@/lib/laundromat/tip/is-tip-token";
import type { TipToken } from "@/lib/laundromat/tip/tip-token";
import { wait } from "@/lib/laundromat/wait";

import type { TipService } from "./tip-service";

const STORAGE_KEY = "laundromat:fake-tips";
const SEED_COIN_COUNT = 36;
const SEED_SPAN_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

const FAKE_TIP_DELAYS_MS = {
  startTip: 700,
  payTip: 1800,
  claimTip: 900,
  restoreToken: 800,
  loadJar: 250,
};

const FAKE_RESTORE_CODE = createTokenCode(
  new Uint8Array([7, 3, 21, 12, 30, 5, 18, 26, 9, 14])
);

type FakeTipState = {
  coins: TipToken[];
  sessions: { [sessionId: string]: number };
};

function seedState(nowMs: number): FakeTipState {
  const coins = Array.from({ length: SEED_COIN_COUNT }, (_, index) => ({
    number: index + 1,
    createdAt: new Date(
      nowMs -
        ((SEED_COIN_COUNT - index) / SEED_COIN_COUNT) * SEED_SPAN_DAYS * DAY_MS
    ).toISOString(),
    code:
      index === 11
        ? FAKE_RESTORE_CODE
        : createTokenCode(crypto.getRandomValues(new Uint8Array(10))),
  }));
  return { coins, sessions: {} };
}

function isFakeTipState(value: unknown): value is FakeTipState {
  return (
    typeof value === "object" &&
    value !== null &&
    "coins" in value &&
    Array.isArray(value.coins) &&
    value.coins.every(isTipToken) &&
    "sessions" in value &&
    typeof value.sessions === "object" &&
    value.sessions !== null
  );
}

/** Create a tip service that keeps every coin in this browser's storage and answers after `FAKE_TIP_DELAYS_MS`, standing in for Stripe Checkout and its webhook. */
export function createFakeTipService(): TipService {
  function read(): FakeTipState {
    try {
      const stored: unknown = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) ?? "null"
      );
      if (isFakeTipState(stored)) return stored;
    } catch {}
    const seeded = seedState(Date.now());
    write(seeded);
    return seeded;
  }
  function write(state: FakeTipState) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }
  return {
    async startTip(options) {
      await wait(FAKE_TIP_DELAYS_MS.startTip);
      const state = read();
      const sessionId = `cs_test_${crypto.randomUUID()}`;
      write({
        ...state,
        sessions: { ...state.sessions, [sessionId]: options.cents },
      });
      return { sessionId };
    },
    async payTip() {
      await wait(FAKE_TIP_DELAYS_MS.payTip);
      return { kind: "paid" };
    },
    async claimTip(options) {
      await wait(FAKE_TIP_DELAYS_MS.claimTip);
      const state = read();
      const coin = {
        number: (state.coins.at(-1)?.number ?? 0) + 1,
        createdAt: new Date().toISOString(),
        code: createTokenCode(crypto.getRandomValues(new Uint8Array(10))),
      };
      write({
        coins: [...state.coins, coin],
        sessions: omit(state.sessions, options.sessionId),
      });
      return coin;
    },
    async restoreToken(options) {
      await wait(FAKE_TIP_DELAYS_MS.restoreToken);
      const coin = read().coins.find(({ code }) => code === options.code);
      return coin === undefined
        ? { kind: "unknown" }
        : { kind: "restored", token: coin };
    },
    async loadJar() {
      await wait(FAKE_TIP_DELAYS_MS.loadJar);
      return read().coins.map(({ number, createdAt }) => ({
        number,
        createdAt,
      }));
    },
  };
}
