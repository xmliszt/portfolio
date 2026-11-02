/** Return the X user id an OAuth 1.0a access token starts with (the digits before its first dash), or `undefined` when it has no such prefix. */
export function parseXUserIdFromToken(accessToken: string) {
  return /^(\d{1,19})-/.exec(accessToken)?.at(1);
}
