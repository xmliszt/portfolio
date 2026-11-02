import "server-only";

export type BlueskyApiResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "error"; status: number; message: string };

/** Send an XRPC request to Bluesky and return the parsed JSON body or its error message; never throws for an HTTP or network error. */
export async function callBlueskyApi<T>(options: {
  url: URL;
  method: "GET" | "POST";
  accessJwt?: string;
  body?:
    | { kind: "json"; value: unknown }
    | { kind: "bytes"; value: Blob; contentType: string };
}): Promise<BlueskyApiResult<T>> {
  const body = options.body;
  try {
    const response = await fetch(options.url, {
      method: options.method,
      headers: {
        ...(options.accessJwt === undefined
          ? {}
          : { Authorization: `Bearer ${options.accessJwt}` }),
        ...(body === undefined
          ? {}
          : {
              "Content-Type":
                body.kind === "json" ? "application/json" : body.contentType,
            }),
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
    const error: { error?: string; message?: string } = (() => {
      try {
        return JSON.parse(text);
      } catch {
        return { message: text.slice(0, 300) };
      }
    })();
    return {
      kind: "error",
      status: response.status,
      message: error.message ?? error.error ?? response.statusText,
    };
  } catch (error) {
    return {
      kind: "error",
      status: 0,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
