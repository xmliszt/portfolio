import { formatRemainingTime } from "./format-remaining-time";
import type { LaundryState } from "./laundry-state";

const APP_TITLE = "Laundromat";

/** Return the tab title: the remaining time while a cycle runs, `done` once it ends, otherwise the app name. */
export function getTabTitle(options: { state: LaundryState; now: number }) {
  const { load } = options.state;
  if (load.kind === "running") {
    const remainingMs = load.startedAt + load.durationMs - options.now;
    return `${formatRemainingTime(remainingMs)} · ${APP_TITLE}`;
  }
  if (load.kind === "done") return `done · ${APP_TITLE}`;
  return APP_TITLE;
}
