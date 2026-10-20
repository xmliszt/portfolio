/** Return the lowercase hex SHA-256 of `code`, which the caller has already made canonical with `parseTokenCode` or `createTokenCode`. */
export async function hashTokenCode(code: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(code)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}
