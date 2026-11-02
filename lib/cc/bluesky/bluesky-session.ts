/** A signed-in Bluesky session: the access token, the account's DID, and the URL of its personal data server. */
export type BlueskySession = { accessJwt: string; did: string; pdsUrl: string };
