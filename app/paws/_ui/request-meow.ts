import { parseMeowResponse } from "@/lib/paws/maker/parse-meow-response";
import type { MeowRequest, MeowResponse } from "@/lib/paws/meow-api-types";

/** Ask `POST /api/paws/meow` for the cat's sound, returning `unreachable` when the request or its body fails. */
export async function requestMeow(options: {
  accessToken: string;
  meow: MeowRequest;
  signal?: AbortSignal;
}): Promise<MeowResponse | { kind: "unreachable" }> {
  try {
    const response = await fetch("/api/paws/meow", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options.meow),
      signal: options.signal,
    });
    return parseMeowResponse(await response.json()) ?? { kind: "unreachable" };
  } catch {
    return { kind: "unreachable" };
  }
}
