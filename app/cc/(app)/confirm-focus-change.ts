export const FOCUS_CHANGE_EVENT = "cc:focus-change";

/** Dispatch a cancelable `FOCUS_CHANGE_EVENT` on `window` and return `true` if no listener cancelled it. */
export function confirmFocusChange() {
  return window.dispatchEvent(
    new Event(FOCUS_CHANGE_EVENT, { cancelable: true })
  );
}
