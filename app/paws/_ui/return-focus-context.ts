import { createContext, type RefObject } from "react";

/** Ref to the room menu's button, or `undefined` outside the room. */
export const ReturnFocusContext = createContext<
  RefObject<HTMLButtonElement | null> | undefined
>(undefined);
