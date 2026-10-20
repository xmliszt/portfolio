"use client";

import { createContext } from "react";

import type { GoldenSpend } from "@/lib/laundromat/tip/tip-token";

import { checkGoldenCharges } from "./tip-actions";

export type CheckCharges = (
  attempts: string[]
) => Promise<GoldenSpend[] | undefined>;

export const ChargeCheckContext = createContext<CheckCharges>((attempts) =>
  checkGoldenCharges({ attempts })
);
