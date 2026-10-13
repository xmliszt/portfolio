import type { RemoteClock } from "./room-presence";

const MAX_ID_LENGTH = 64;

/** Return the clock reading another tab broadcast, or `undefined` when the payload is not one. */
export function parseRemoteClock(value: unknown): RemoteClock | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("sessionId" in value && typeof value.sessionId === "string") ||
    !("visitorId" in value && typeof value.visitorId === "string") ||
    !("sentAt" in value && typeof value.sentAt === "number") ||
    !Number.isFinite(value.sentAt) ||
    value.sessionId.length > MAX_ID_LENGTH ||
    value.visitorId.length > MAX_ID_LENGTH
  ) {
    return undefined;
  }
  return {
    sessionId: value.sessionId,
    visitorId: value.visitorId,
    sentAt: value.sentAt,
  };
}
