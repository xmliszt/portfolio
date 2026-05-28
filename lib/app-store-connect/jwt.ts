import "server-only";

import { importPKCS8, SignJWT } from "jose";

/**
 * Sign an App Store Connect API JWT.
 *
 * Spec: ES256, header includes `kid`, payload includes
 * `iss` (issuer id), `iat`, `exp` (<= 20 minutes), `aud: "appstoreconnect-v1"`.
 *
 * https://developer.apple.com/documentation/appstoreconnectapi/generating-tokens-for-api-requests
 */
export async function signAppStoreConnectJwt(options: {
  keyId: string;
  issuerId: string;
  privateKeyPem: string;
  /** Lifetime in seconds (default 600, max 1200). */
  lifetimeSeconds?: number;
}): Promise<string> {
  const lifetimeSeconds = options.lifetimeSeconds ?? 600;
  const privateKey = await importPKCS8(
    normalizePem(options.privateKeyPem),
    "ES256"
  );

  return new SignJWT({})
    .setProtectedHeader({
      alg: "ES256",
      kid: options.keyId,
      typ: "JWT",
    })
    .setIssuer(options.issuerId)
    .setAudience("appstoreconnect-v1")
    .setIssuedAt()
    .setExpirationTime(`${lifetimeSeconds}s`)
    .sign(privateKey);
}

/**
 * Accept both genuine multi-line PEMs and `\n`-escaped single-line PEMs
 * (which some env editors produce). Normalize to real newlines.
 */
function normalizePem(value: string): string {
  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
}
