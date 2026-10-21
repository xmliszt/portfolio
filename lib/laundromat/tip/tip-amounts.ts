export const TIP_COINS_CENTS = [100, 200, 500, 1000] as const;

export const CUSTOM_TIP_CENTS = { min: 100, max: 50000 } as const;

export const TIP_USE_TIERS = [
  { minCents: 1000, uses: 15 },
  { minCents: 500, uses: 6 },
  { minCents: 200, uses: 2 },
  { minCents: CUSTOM_TIP_CENTS.min, uses: 1 },
] as const;
