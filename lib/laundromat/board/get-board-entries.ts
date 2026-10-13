import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import { BOARD_UPDATES } from "./board-updates";

/** Return the newest `count` board updates (all of them when `count` is `undefined`), each with its `isoDate`, its day formatted for `copy.locale` and its tag, title and body in `copy`. */
export function getBoardEntries(options: {
  copy: LaundromatCopy;
  count?: number;
}) {
  const { board } = options.copy;
  const dateFormat = new Intl.DateTimeFormat(options.copy.locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return BOARD_UPDATES.slice(0, options.count).map((update) => ({
    id: update.id,
    isoDate: update.date,
    date: dateFormat.format(new Date(`${update.date}T00:00:00Z`)),
    tag: board.tags[update.tag],
    ...board.updates[update.id],
  }));
}
