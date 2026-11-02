import "server-only";

import { randomBytes } from "node:crypto";

import { buildXOAuthHeader } from "./build-x-oauth-header";
import type { XApiResult } from "./x-api-result";
import type { XUserCredentials } from "./x-user-credentials";

type XErrorBody = {
  title?: string;
  detail?: string;
  message?: string;
  errors?: { message?: string; detail?: string }[];
};

function describeError(body: XErrorBody, fallback: string) {
  return (
    body.detail ??
    body.errors?.at(0)?.message ??
    body.errors?.at(0)?.detail ??
    body.message ??
    body.title ??
    fallback
  );
}

/** Send a request signed as the owner to X at `url` with a JSON or multipart `body`, and return the parsed JSON response or X's error; never throws for an HTTP or network error. */
export async function callXApi<T>(options: {
  method: "GET" | "POST";
  url: URL;
  credentials: XUserCredentials;
  body?: { kind: "json"; value: unknown } | { kind: "form"; value: FormData };
}): Promise<XApiResult<T>> {
  const authorization = buildXOAuthHeader({
    method: options.method,
    url: options.url,
    credentials: options.credentials,
    nonce: randomBytes(16).toString("hex"),
    timestampS: Math.floor(Date.now() / 1000),
  });
  const body = options.body;
  try {
    const response = await fetch(options.url, {
      method: options.method,
      headers: {
        Authorization: authorization,
        ...(body?.kind === "json"
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body:
        body === undefined
          ? undefined
          : body.kind === "json"
            ? JSON.stringify(body.value)
            : body.value,
      cache: "no-store",
    });
    const text = await response.text();
    if (response.ok) {
      const data: T = JSON.parse(text === "" ? "{}" : text);
      return { kind: "ok", data };
    }
    const errorBody: XErrorBody = (() => {
      try {
        return JSON.parse(text);
      } catch {
        return { message: text.slice(0, 300) };
      }
    })();
    return {
      kind: "error",
      status: response.status,
      message: describeError(errorBody, response.statusText),
    };
  } catch (error) {
    return {
      kind: "error",
      status: 0,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
