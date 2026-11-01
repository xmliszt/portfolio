import { createHmac, timingSafeEqual } from "node:crypto";

/** Return the payload of a Meta `signed_request` when its HMAC-SHA256 signature matches `appSecret`, or `undefined` when it is malformed or forged. */
export function parseSignedRequest(options: {
  signedRequest: string;
  appSecret: string;
}) {
  const [signaturePart, payloadPart] = options.signedRequest.split(".", 2);
  if (!signaturePart || !payloadPart) return undefined;
  const expected = createHmac("sha256", options.appSecret)
    .update(payloadPart)
    .digest();
  const signature = Buffer.from(signaturePart, "base64url");
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(signature, expected)
  ) {
    return undefined;
  }
  try {
    const payload: unknown = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf8")
    );
    return typeof payload === "object" && payload !== null
      ? payload
      : undefined;
  } catch {
    return undefined;
  }
}
