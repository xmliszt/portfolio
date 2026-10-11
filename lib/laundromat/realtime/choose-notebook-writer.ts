import { MAX_WRITING_MS } from "./max-writing-ms";
import type { RoomPresence } from "./room-presence";

/** Return the `sessionId` holding the notebook at `now`: whichever tab has been writing longest without passing `MAX_WRITING_MS`, the lower id winning a tie, or `undefined` when nobody is writing. */
export function chooseNotebookWriter(options: {
  presences: RoomPresence[];
  now: number;
}) {
  return options.presences
    .flatMap(({ sessionId, writingSince }) =>
      writingSince === undefined || writingSince < options.now - MAX_WRITING_MS
        ? []
        : [{ sessionId, writingSince }]
    )
    .toSorted(
      (a, b) =>
        a.writingSince - b.writingSince ||
        a.sessionId.localeCompare(b.sessionId)
    )
    .at(0)?.sessionId;
}
