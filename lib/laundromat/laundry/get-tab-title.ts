import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import { formatRemainingTime } from "./format-remaining-time";
import type { LaundryState } from "./laundry-state";

/** Return the tab title: the remaining time while a cycle runs, `copy.tabDone` once it ends, otherwise the app name. */
export function getTabTitle(options: {
  state: LaundryState;
  now: number;
  copy: LaundromatCopy;
}) {
  const appTitle = options.copy.site.name;
  const { load } = options.state;
  if (load.kind === "running") {
    const remainingMs = load.startedAt + load.durationMs - options.now;
    return `${formatRemainingTime(remainingMs)} · ${appTitle}`;
  }
  if (load.kind === "done") return `${options.copy.tabDone} · ${appTitle}`;
  return appTitle;
}
