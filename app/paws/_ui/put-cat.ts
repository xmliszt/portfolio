import type { PutCatRequest, PutCatResponse } from "@/lib/paws/cat-api-types";
import { parsePutCatResponse } from "@/lib/paws/maker/parse-put-cat-response";

/** Save the cat's look and voice with `PUT /api/paws/cat`, returning `unreachable` when the request or its body fails. */
export async function putCat(options: {
  accessToken: string;
  cat: PutCatRequest;
  signal?: AbortSignal;
}): Promise<PutCatResponse | { kind: "unreachable" }> {
  try {
    const response = await fetch("/api/paws/cat", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options.cat),
      signal: options.signal,
    });
    return (
      parsePutCatResponse(await response.json()) ?? { kind: "unreachable" }
    );
  } catch {
    return { kind: "unreachable" };
  }
}
