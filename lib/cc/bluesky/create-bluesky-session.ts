import "server-only";

import type { BlueskySession } from "./bluesky-session";
import { type BlueskyApiResult, callBlueskyApi } from "./call-bluesky-api";

const ENTRYWAY = "https://bsky.social";

type SessionResponse = {
  accessJwt: string;
  did: string;
  didDoc?: {
    service?: { id: string; type: string; serviceEndpoint: string }[];
  };
};

/** Sign in to Bluesky with `handle` and an app password and return the session, with the account's own data server read from its DID document. */
export async function createBlueskySession(options: {
  handle: string;
  appPassword: string;
}): Promise<BlueskyApiResult<BlueskySession>> {
  const created = await callBlueskyApi<SessionResponse>({
    url: new URL("/xrpc/com.atproto.server.createSession", ENTRYWAY),
    method: "POST",
    body: {
      kind: "json",
      value: { identifier: options.handle, password: options.appPassword },
    },
  });
  if (created.kind === "error") return created;
  const pds = created.data.didDoc?.service?.find(
    (service) => service.id === "#atproto_pds"
  );
  return {
    kind: "ok",
    data: {
      accessJwt: created.data.accessJwt,
      did: created.data.did,
      pdsUrl: pds?.serviceEndpoint ?? ENTRYWAY,
    },
  };
}
