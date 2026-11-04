import type { DeleteAccountResponse } from "@/lib/paws/account-api-types";
import { parseDeleteAccountResponse } from "@/lib/paws/profile/parse-delete-account-response";

/** Delete the signed-in visitor's account with `DELETE /api/paws/account`, returning `unreachable` when the request or its body fails. */
export async function deleteAccount(options: {
  accessToken: string;
}): Promise<DeleteAccountResponse | { kind: "unreachable" }> {
  try {
    const response = await fetch("/api/paws/account", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${options.accessToken}` },
    });
    return (
      parseDeleteAccountResponse(await response.json()) ?? {
        kind: "unreachable",
      }
    );
  } catch {
    return { kind: "unreachable" };
  }
}
