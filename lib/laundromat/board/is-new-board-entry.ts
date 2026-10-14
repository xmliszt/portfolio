import { BOARD_UPDATE_IDS } from "./board-updates";

/** `true` if `id` is missing from this build's `BOARD_UPDATE_IDS`; `false` when this build already ships it. */
export function isNewBoardEntry(id: string) {
  return !BOARD_UPDATE_IDS.some((known) => known === id);
}
