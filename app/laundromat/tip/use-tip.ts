import { useContext } from "react";

import { TipContext } from "./tip-state";

/** Return the tip state from the nearest `TipProvider`, or `undefined` outside one. */
export function useTip() {
  return useContext(TipContext);
}
