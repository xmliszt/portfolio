import type { GetCatResponse } from "@/lib/paws/cat-api-types";
import { parseGetCatResponse } from "@/lib/paws/maker/parse-get-cat-response";

/** Return the signed-in visitor's saved cat from `GET /api/paws/cat`, or `unreachable` when the request or its body fails. */
export async function fetchSavedCat(options: {
  accessToken: string;
  signal?: AbortSignal;
}): Promise<GetCatResponse | { kind: "unreachable" }> {
  try {
    const response = await fetch("/api/paws/cat", {
      headers: { Authorization: `Bearer ${options.accessToken}` },
      cache: "no-store",
      signal: options.signal,
    });
    return (
      parseGetCatResponse(await response.json()) ?? { kind: "unreachable" }
    );
  } catch {
    return { kind: "unreachable" };
  }
}
