const VISITOR_ID_STORAGE_KEY = "laundromat:visitor-id";

/** Return the visitor id kept in `localStorage`, making and storing a random one the first time. */
export function readOrCreateVisitorId() {
  const stored = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);
  if (stored !== null) return stored;
  const visitorId = window.crypto.randomUUID();
  window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId);
  return visitorId;
}
