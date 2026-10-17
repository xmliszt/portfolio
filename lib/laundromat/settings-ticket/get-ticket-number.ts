const TICKET_NUMBER_MODULO = 10_000;
const MS_PER_MINUTE = 60_000;

/** Return the four-digit number printed on a laundry ticket printed at `printedAt`, counting minutes since the epoch. */
export function getTicketNumber(printedAt: Date) {
  return String(
    Math.floor(printedAt.getTime() / MS_PER_MINUTE) % TICKET_NUMBER_MODULO
  ).padStart(4, "0");
}
