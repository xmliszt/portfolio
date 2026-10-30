/** Return the client address from `x-forwarded-for` (first entry) or `x-real-ip`, or `"unknown"` when neither is set. */
export function readRequestIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",").at(0)?.trim();
  if (forwarded !== undefined && forwarded !== "") return forwarded;
  return headers.get("x-real-ip")?.trim() || "unknown";
}
