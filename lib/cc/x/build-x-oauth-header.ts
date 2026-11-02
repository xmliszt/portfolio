import { createHmac } from "node:crypto";

import type { XUserCredentials } from "./x-user-credentials";

function encode(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/** Return the OAuth 1.0a `Authorization` header that signs a `method` request to `url` (its query included) with HMAC-SHA1, leaving the request body out of the signature. */
export function buildXOAuthHeader(options: {
  method: string;
  url: URL;
  credentials: XUserCredentials;
  nonce: string;
  timestampS: number;
}) {
  const oauthParams = {
    oauth_consumer_key: options.credentials.apiKey,
    oauth_nonce: options.nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(options.timestampS),
    oauth_token: options.credentials.accessToken,
    oauth_version: "1.0",
  };
  const paramString = [
    ...Object.entries(oauthParams),
    ...options.url.searchParams.entries(),
  ]
    .map(([name, value]) => [encode(name), encode(value)])
    .toSorted(([nameA, valueA], [nameB, valueB]) =>
      nameA === nameB ? valueA.localeCompare(valueB) : nameA < nameB ? -1 : 1
    )
    .map(([name, value]) => `${name}=${value}`)
    .join("&");
  const baseUrl = `${options.url.origin}${options.url.pathname}`;
  const baseString = [
    options.method.toUpperCase(),
    encode(baseUrl),
    encode(paramString),
  ].join("&");
  const signingKey = `${encode(options.credentials.apiSecret)}&${encode(options.credentials.accessTokenSecret)}`;
  const signature = createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");
  const header = Object.entries({
    ...oauthParams,
    oauth_signature: signature,
  })
    .map(([name, value]) => `${encode(name)}="${encode(value)}"`)
    .join(", ");
  return `OAuth ${header}`;
}
