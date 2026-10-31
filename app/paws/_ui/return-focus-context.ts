import { createContext, type RefObject } from "react";

/** The room menu's button: the menu attaches it, and a dialog hands focus back to it when the element that opened the dialog is gone. */
export const ReturnFocusContext = createContext<
  RefObject<HTMLButtonElement | null> | undefined
>(undefined);
