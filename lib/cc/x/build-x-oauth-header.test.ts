import assert from "node:assert/strict";
import { test } from "node:test";

import { buildXOAuthHeader } from "./build-x-oauth-header";

test("matches X's documented signature example", () => {
  const url = new URL("https://api.twitter.com/1.1/statuses/update.json");
  url.searchParams.set("include_entities", "true");
  url.searchParams.set(
    "status",
    "Hello Ladies + Gentlemen, a signed OAuth request!"
  );
  const header = buildXOAuthHeader({
    method: "post",
    url,
    credentials: {
      apiKey: "xvz1evFS4wEEPTGEFPHBog",
      apiSecret: "kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw",
      accessToken: "370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
      accessTokenSecret: "LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE",
    },
    nonce: "kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
    timestampS: 1318622958,
  });
  assert.match(header, /^OAuth /);
  assert.match(header, /oauth_signature="hCtSmYh%2BiHYCEqBWrE7C7hYmtUk%3D"/);
  assert.match(
    header,
    /oauth_token="370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb"/
  );
});
